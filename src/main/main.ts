// @ts-nocheck

import {
  app,
  BrowserWindow,
  ipcMain,
  shell
} from 'electron'
import path from 'path'

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

import EddDatabase from './utils/database/EddDatabase'

const userDataPath = app.getPath('userData')
const database = new EddDatabase(userDataPath)

const currentDownloadItems = new CurrentDownloadItems()

let appWindow

// `downloadIdContext` holds the downloadId for a new file beginning to download.
// `beginDownload`, or `willDownload` will save the downloadId associated with a new URL
// so that within willDownload we can associate the DownloadItem instance with the correct download.
const downloadIdContext = {}

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

  appWindow.webContents.session.on('will-download', async (event, item, webContents) => {
    await willDownload({
      currentDownloadItems,
      database,
      downloadIdContext,
      event,
      item,
      webContents
    })
  })

  // Title bar click event handler
  appWindow.on('resize', () => {
    appWindow.webContents.send('windowsLinuxTitleBar', appWindow.isMaximized())
  })

  // Maximize the Windows OS layout
  ipcMain.on('maximizeWindow', () => {
    if (appWindow.isMaximized()) {
      appWindow.unmaximize()
    } else {
      appWindow.maximize()
    }
  })

  // Minimize the Windows OS layout
  ipcMain.on('minimizeWindow', () => {
    appWindow.minimize()
  })

  // Close the Windows OS layout
  ipcMain.on('closeWindow', () => {
    appWindow.close()
  })

  ipcMain.on('chooseDownloadLocation', () => {
    chooseDownloadLocation({
      appWindow
    })
  })

  ipcMain.on('beginDownload', async (event, info) => {
    await beginDownload({
      database,
      downloadIdContext,
      currentDownloadItems,
      info,
      webContents: appWindow.webContents
    })
  })

  ipcMain.on('clearDefaultDownload', async () => {
    await clearDefaultDownload({
      database
    })
  })

  appWindow.webContents.once('did-finish-load', () => {
    // Show the electron appWindow
    appWindow.show()

    // Open the DevTools if running in development.
    if (!app.isPackaged) appWindow.webContents.openDevTools({ mode: 'detach' })
  })

  ipcMain.on('pauseDownloadItem', async (event, info) => {
    await pauseDownloadItem({
      database,
      currentDownloadItems,
      info
    })
  })

  ipcMain.on('cancelDownloadItem', async (event, info) => {
    await cancelDownloadItem({
      database,
      currentDownloadItems,
      info
    })
  })

  ipcMain.on('resumeDownloadItem', async (event, info) => {
    await resumeDownloadItem({
      database,
      currentDownloadItems,
      info
    })
  })

  // Set up an interval to report progress to the renderer process every 1s
  const reportProgressInterval = setInterval(async () => {
    await reportProgress({
      database,
      webContents: appWindow.webContents
    })
  }, 1000)

  // When the window is going to close, clear the reportProgressInterval
  appWindow.on('close', () => {
    if (reportProgressInterval) clearInterval(reportProgressInterval)
  })

  ipcMain.on('openDownloadFolder', (event, info) => {
    openDownloadFolder({
      database,
      info
    })
  })

  ipcMain.on('copyDownloadPath', (event, info) => {
    copyDownloadPath({
      database,
      info
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
      downloadIdContext
    })
  })

  // Create window, load the rest of the app, etc...
  app.whenReady().then(async () => {
    await createWindow()
  })

  // Handle the protocol. In this case, we choose to show an Error Box.
  app.on('open-url', async (event, url) => {
    await openUrl({
      appWindow,
      currentDownloadItems,
      database,
      deepLink: url,
      downloadIdContext
    })
  })
}
