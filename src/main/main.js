const {
  app,
  BrowserWindow,
  ipcMain,
  shell,
  clipboard
} = require('electron')
const path = require('path')
const Store = require('electron-store')

const storageSchema = require('./storageSchema.json')

const beginDownload = require('./eventHandlers/beginDownload')
const chooseDownloadLocation = require('./eventHandlers/chooseDownloadLocation')
const clearDefaultDownload = require('./eventHandlers/clearDefaultDownload')
const didFinishLoad = require('./eventHandlers/didFinishLoad')
const windowStateKeeper = require('./utils/windowStateKeeper')
const willDownload = require('./eventHandlers/willDownload')
const reportProgress = require('./eventHandlers/reportProgress')

const CurrentDownloadItems = require('./utils/currentDownloadItems')
const downloadStates = require('../app/constants/downloadStates')

const { downloads } = require('../../test-download-files.json')
// const { downloads } = require('../../test-download-files-one-collection.json')
// const { downloads } = require('../../test-download-files-one-file.json')

const store = new Store({
  // TODO set this key before publishing application
  // encryptionKey: 'this key only obscures the data',
  name: 'preferences',
  schema: storageSchema,
  defaults: {
    preferences: {
      concurrentDownloads: 5
    }
  }
})

// Uncomment this line to delete your local storage
// store.clear()

const today = new Date()
  .toISOString()
  .replace(/(:|-)/g, '')
  .replace('T', '_')
  .split('.')[0]

const pendingDownloads = downloads.reduce((map, download) => ({
  ...map,
  [`${download.id}-${today}`]: {
    ...download
  }
}), {})

const currentDownloadItems = new CurrentDownloadItems()

const createWindow = () => {
  const windowState = windowStateKeeper(store)

  const window = new BrowserWindow({
    width: windowState.width,
    height: windowState.height,
    minWidth: 400,
    minHeight: 445,
    x: windowState.x,
    y: windowState.y,
    maximizable: false,
    show: false,
    title: 'Earthdata Download',
    titleBarStyle: 'hiddenInset',
    frame: false,
    webPreferences: {
      preload: path.join(__dirname, '..', 'preload', 'preload.js')
    }
  })

  windowState.track(window)

  window.menuBarVisible = false

  // ? how does this work when deployed?
  window.loadURL('http://localhost:5173/')

  // `downloadIdContext` holds the downloadId for a new file beginning to download.
  // `beginDownload`, or `willDownload` will save the downloadId associated with a new URL
  // so that within willDownload we can associate the DownloadItem instance with the correct download.
  const downloadIdContext = {}
  window.webContents.session.on('will-download', (event, item, webContents) => {
    const url = item.getURL()
    const downloadId = downloadIdContext[url]

    delete downloadIdContext[url]

    willDownload({
      downloadIdContext,
      currentDownloadItems,
      downloadId,
      event,
      item,
      store,
      webContents
    })
  })

  ipcMain.on('chooseDownloadLocation', () => {
    chooseDownloadLocation({
      window
    })
  })

  ipcMain.on('beginDownload', (event, info) => {
    beginDownload({
      downloadIdContext,
      currentDownloadItems,
      info,
      store,
      webContents: window.webContents,
      pendingDownloads
    })
  })

  ipcMain.on('clearDefaultDownload', () => {
    clearDefaultDownload({
      store,
      window
    })
  })

  window.webContents.once('did-finish-load', () => {
    setTimeout(() => {
      didFinishLoad({
        downloadIds: Object.keys(pendingDownloads),
        store,
        window
      })
    }, 100)
  })

  ipcMain.on('pauseDownloadItem', (event, info) => {
    const { downloadId, name } = info

    currentDownloadItems.pauseItem(downloadId, name)

    if (downloadId && !name) store.set(`downloads.${downloadId}.state`, downloadStates.paused)

    if (!downloadId) {
      const downloads = store.get('downloads')
      Object.keys(downloads).forEach((downloadId) => {
        const download = downloads[downloadId]
        const { state } = download

        const newState = state === downloadStates.active ? downloadStates.paused : state
        download.state = newState
      })
      store.set('downloads', downloads)
    }
  })

  ipcMain.on('cancelDownloadItem', (event, info) => {
    const { downloadId, name } = info

    store.set(`downloads.${downloadId}.state`, downloadStates.completed)

    currentDownloadItems.cancelItem(downloadId, name)

    // Cancelling a download will remove it from the list of downloads
    // TODO how will this work when cancelling a granule download? I don't think we want to remove single items from a provided list of links
    if (downloadId && !name) store.delete(`downloads.${downloadId}`)

    if (!downloadId) store.delete('downloads')
  })

  ipcMain.on('resumeDownloadItem', (event, info) => {
    const { downloadId, name } = info

    currentDownloadItems.resumeItem(downloadId, name)

    if (downloadId && !name) store.set(`downloads.${downloadId}.state`, downloadStates.active)

    if (!downloadId) {
      const downloads = store.get('downloads')
      Object.keys(downloads).forEach((downloadId) => {
        const download = downloads[downloadId]
        const { state } = download

        const newState = state === downloadStates.paused ? downloadStates.active : state
        download.state = newState
      })
      store.set('downloads', downloads)
    }
  })

  let isReporting = false
  ipcMain.on('requestProgressReport', () => {
    // if (isReporting || currentDownloadItems.getNumberOfDownloads() === 0) return
    if (isReporting) return

    setInterval(() => {
      isReporting = reportProgress({
        store,
        webContents: window.webContents
      })
    }, 1000)
  })

  ipcMain.on('openDownloadFolder', (event, info) => {
    const { downloadId } = info
    const folderPath = store.get('downloads')[downloadId].downloadLocation
    shell.openPath(folderPath)
  })

  ipcMain.on('copyDownloadPath', (event, info) => {
    const { downloadId } = info
    const folderPath = store.get('downloads')[downloadId].downloadLocation
    clipboard.writeText(folderPath)
  })

  // Open `target="_blank"` links in the system browser
  window.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url)
    return { action: 'deny' }
  })
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(createWindow)

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.

  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})
