// @ts-nocheck

import {
  app,
  BrowserWindow,
  ipcMain,
  shell
} from 'electron'
import path from 'path'
import Store from 'electron-store'

import storageSchema from './storageSchema.json'

import beginDownload from './eventHandlers/beginDownload'
import cancelDownloadItem from './eventHandlers/cancelDownloadItem'
import chooseDownloadLocation from './eventHandlers/chooseDownloadLocation'
import clearDefaultDownload from './eventHandlers/clearDefaultDownload'
import copyDownloadPath from './eventHandlers/copyDownloadPath'
import openDownloadFolder from './eventHandlers/openDownloadFolder'
import openUrl from './eventHandlers/openUrl'
import pauseDownloadItem from './eventHandlers/pauseDownloadItem'
import reportProgress from './eventHandlers/reportProgress'
import resumeDownloadItem from './eventHandlers/resumeDownloadItem'
import willDownload from './eventHandlers/willDownload'

import CurrentDownloadItems from './utils/currentDownloadItems'
import windowStateKeeper from './utils/windowStateKeeper'

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

const currentDownloadItems = new CurrentDownloadItems()

let appWindow

// `downloadIdContext` holds the downloadId for a new file beginning to download.
// `beginDownload`, or `willDownload` will save the downloadId associated with a new URL
// so that within willDownload we can associate the DownloadItem instance with the correct download.
const downloadIdContext = {}

const createWindow = () => {
  const windowState = windowStateKeeper(store)

  appWindow = new BrowserWindow({
    width: windowState.width,
    height: windowState.height,
    minWidth: 400,
    minHeight: 445,
    x: windowState.x,
    y: windowState.y,
    show: false,
    title: 'Earthdata Download',
    // TODO we want to use hiddenInset, but windows buttons aren't visible. We'll need to manually add the windows buttons, and send messages to the main process to perform the button actions.
    // titleBarStyle: 'hiddenInset',
    titleBarStyle: 'hidden',
    titleBarOverlay: {
      color: '#2A81BB',
      symbolColor: '#FCFCFC',
      height: 39
    },
    frame: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    }
  })

  windowState.track(appWindow)

  appWindow.menuBarVisible = false

  // You can use `process.env.VITE_DEV_SERVER_URL` when the vite command is called with `serve`
  if (process.env.VITE_DEV_SERVER_URL) {
    appWindow.loadURL(process.env.VITE_DEV_SERVER_URL)
  } else {
    // Load your file
    appWindow.loadFile('dist/index.html')
  }

  appWindow.webContents.session.on('will-download', (event, item, webContents) => {
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
      appWindow
    })
  })

  ipcMain.on('beginDownload', (event, info) => {
    beginDownload({
      downloadIdContext,
      currentDownloadItems,
      info,
      store,
      webContents: appWindow.webContents
    })
  })

  ipcMain.on('clearDefaultDownload', () => {
    clearDefaultDownload({
      store,
      appWindow
    })
  })

  appWindow.webContents.once('did-finish-load', () => {
    // Show the electron appWindow
    appWindow.show()

    // Open the DevTools if running in development.
    if (!app.isPackaged) appWindow.webContents.openDevTools({ mode: 'detach' })
  })

  ipcMain.on('pauseDownloadItem', (event, info) => {
    pauseDownloadItem({
      currentDownloadItems,
      info,
      store
    })
  })

  ipcMain.on('cancelDownloadItem', (event, info) => {
    cancelDownloadItem({
      currentDownloadItems,
      info,
      store
    })
  })

  ipcMain.on('resumeDownloadItem', (event, info) => {
    resumeDownloadItem({
      currentDownloadItems,
      info,
      store
    })
  })

  // Set up an interval to report progress to the renderer process every 1s
  const reportProgressInterval = setInterval(() => {
    reportProgress({
      store,
      webContents: appWindow.webContents
    })
  }, 1000)

  // When the window is going to close, clear the reportProgressInterval
  appWindow.on('close', () => {
    if (reportProgressInterval) clearInterval(reportProgressInterval)
  })

  ipcMain.on('openDownloadFolder', (event, info) => {
    openDownloadFolder({
      info,
      store
    })
  })

  ipcMain.on('copyDownloadPath', (event, info) => {
    copyDownloadPath({
      info,
      store
    })
  })

  // Open `target="_blank"` links in the system browser
  appWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url)
    return { action: 'deny' }
  })
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
// app.whenReady().then(createWindow)

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

if (process.defaultApp) {
  if (process.argv.length >= 2) {
    app.setAsDefaultProtocolClient('earthdata-download', process.execPath, [path.resolve(process.argv[1])])
  }
} else {
  app.setAsDefaultProtocolClient('earthdata-download')
}

const gotTheLock = app.requestSingleInstanceLock()

if (!gotTheLock) {
  app.quit()
} else {
  app.on('second-instance', (event, commandLine) => {
    // Someone tried to run a second instance, we should focus our window.
    if (appWindow) {
      if (appWindow.isMinimized()) appWindow.restore()
      appWindow.focus()
    }
    // the commandLine is array of strings in which last element is deep link url
    // the url str ends with /

    const url = commandLine.pop().slice(0, -1)

    openUrl({
      deepLink: url,
      store,
      appWindow
    })
  })

  // Create window, load the rest of the app, etc...
  app.whenReady().then(() => {
    createWindow()
  })

  // Handle the protocol. In this case, we choose to show an Error Box.
  app.on('open-url', (event, url) => {
    openUrl({
      deepLink: url,
      store,
      appWindow
    })
  })
}
