// @ts-nocheck

import {
  app,
  BrowserWindow,
  session
} from 'electron'
import path from 'path'

import openUrl from './eventHandlers/openUrl'

import CurrentDownloadItems from './utils/currentDownloadItems'
import EddDatabase from './utils/database/EddDatabase'
import setupEventListeners from './utils/setupEventListeners'
import windowStateKeeper from './utils/windowStateKeeper'

const userDataPath = app.getPath('userData')
const database = new EddDatabase(userDataPath)

const currentDownloadItems = new CurrentDownloadItems()

let appWindow

// `downloadIdContext` holds the downloadId for a new file beginning to download.
// `beginDownload`, or `willDownload` will save the downloadId associated with a new URL
// so that within willDownload we can associate the DownloadItem instance with the correct download.
const downloadIdContext = {}

// `downloadsWaitingForAuth` holds downloadIds when that download is waiting for authentication.
// This allows us to only try getting auth for 1 file, and not open too many auth windows
const downloadsWaitingForAuth = {}

const createWindow = async () => {
  // Ensure the database is up to date
  await database.migrateDatabase()

  const windowState = await windowStateKeeper(database)

  appWindow = new BrowserWindow({
    width: windowState.width,
    height: windowState.height,
    minWidth: 400,
    minHeight: 445,
    x: windowState.x,
    y: windowState.y,
    show: false,
    title: 'Earthdata Download',
    titleBarStyle: 'hiddenInset',
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

  // TODO Remove this after electron supports adding headers to downloadURL()
  // https://github.com/electron/electron/pull/38785 has been merged, waiting for a release
  appWindow.webContents.session.webRequest.onBeforeSendHeaders(async (details, callback) => {
    const { token } = await database.getToken()

    await session.defaultSession.clearStorageData()

    let bearerToken
    if (token) {
      bearerToken = `Bearer ${token}`
    } else {
      // If we have no token in the database, clear the cookie data that is saved by providers downloads
    }

    callback({
      requestHeaders: {
        ...details.requestHeaders,
        Authorization: bearerToken
      }
    })
  })

  // Setup event listeners that depend on appWindow
  setupEventListeners({
    appWindow,
    currentDownloadItems,
    database,
    downloadIdContext,
    downloadsWaitingForAuth
  })
}

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', async () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.

  if (BrowserWindow.getAllWindows().length === 0) {
    await createWindow()
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
  app.on('second-instance', async (event, commandLine) => {
    // Someone tried to run a second instance, we should focus our window.
    if (appWindow) {
      if (appWindow.isMinimized()) appWindow.restore()
      appWindow.focus()
    }
    // the commandLine is array of strings in which last element is deep link url
    // the url str ends with /

    const url = commandLine.pop().slice(0, -1)

    await openUrl({
      appWindow,
      currentDownloadItems,
      database,
      deepLink: url,
      downloadIdContext,
      downloadsWaitingForAuth,
      webContents: appWindow.webContents
    })
  })

  app.on('open-url', async (event, url) => {
    await openUrl({
      appWindow,
      currentDownloadItems,
      database,
      deepLink: url,
      downloadIdContext,
      downloadsWaitingForAuth,
      webContents: appWindow.webContents
    })
  })

  // Create window, load the rest of the app, etc...
  app.whenReady().then(async () => {
    await createWindow()
  })
}
