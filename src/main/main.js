const {
  app,
  BrowserWindow,
  ipcMain,
  shell
} = require('electron')
const path = require('path')
const Store = require('electron-store')

const storageSchema = require('./storageSchema.json')

const { beginDownload } = require('./eventHandlers/beginDownload')
const { chooseDownloadLocation } = require('./eventHandlers/chooseDownloadLocation')
const { clearDefaultDownload } = require('./eventHandlers/clearDefaultDownload')
const { didFinishLoad } = require('./eventHandlers/didFinishLoad')
const { windowStateKeeper } = require('./windowStateKeeper')

const store = new Store({
  // TODO set this key before publishing application
  // encryptionKey: 'this key only obsures the data',
  name: 'preferences',
  schema: storageSchema,
  defaults: {
    preferences: {
      createSubDirectories: true
    }
  }
})

// Uncomment this line to delete your local storage
// store.clear()

// const downloadId = 'test-download'
const downloadId = `shortName_version-${new Date().getTime()}`

const createWindow = () => {
  const windowState = windowStateKeeper(store)

  const window = new BrowserWindow({
    width: windowState.width,
    height: windowState.height,
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

  ipcMain.on('chooseDownloadLocation', () => {
    chooseDownloadLocation({
      window
    })
  })

  ipcMain.on('beginDownload', (event, info) => {
    beginDownload({
      info,
      store
    })
  })

  ipcMain.on('clearDefaultDownload', () => {
    clearDefaultDownload({
      downloadId,
      store,
      window
    })
  })

  window.webContents.once('did-finish-load', () => {
    didFinishLoad({
      downloadId,
      store,
      window
    })
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
