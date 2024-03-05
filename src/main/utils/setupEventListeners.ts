// @ts-nocheck

import {
  app,
  dialog,
  ipcMain,
  shell
} from 'electron'

import beforeQuit from '../eventHandlers/beforeQuit'
import beginDownload from '../eventHandlers/beginDownload'
import cancelDownloadItem from '../eventHandlers/cancelDownloadItem'
import cancelErroredDownloadItem from '../eventHandlers/cancelErroredDownloadItem'
import chooseDownloadLocation from '../eventHandlers/chooseDownloadLocation'
import clearDownload from '../eventHandlers/clearDownload'
import copyDownloadPath from '../eventHandlers/copyDownloadPath'
import deleteDownload from '../eventHandlers/deleteDownload'
import deleteDownloadHistory from '../eventHandlers/deleteDownloadHistory'
import didFinishLoad from '../eventHandlers/didFinishLoad'
import getPreferenceFieldValue from '../eventHandlers/getPreferenceFieldValue'
import metricsLogger from '../utils/metricsLogger'
import openDownloadFolder from '../eventHandlers/openDownloadFolder'
import pauseDownloadItem from '../eventHandlers/pauseDownloadItem'
import requestDownloadsProgress from '../eventHandlers/requestDownloadsProgress'
import requestFilesProgress from '../eventHandlers/requestFilesProgress'
import restartDownload from '../eventHandlers/restartDownload'
import resumeDownloadItem from '../eventHandlers/resumeDownloadItem'
import retryErroredDownloadItem from '../eventHandlers/retryErroredDownloadItem'
import sendToEula from '../eventHandlers/sendToEula'
import sendToLogin from '../eventHandlers/sendToLogin'
import setCancellingDownload from '../eventHandlers/setCancellingDownload'
import setPendingDeleteDownloadHistory from '../eventHandlers/setPendingDeleteDownloadHistory'
import setPreferenceFieldValue from '../eventHandlers/setPreferenceFieldValue'
import setRestartingDownload from '../eventHandlers/setRestartingDownload'
import startPendingDownloads from '../utils/startPendingDownloads'
import undoCancellingDownload from '../eventHandlers/undoCancellingDownload'
import undoClearDownload from '../eventHandlers/undoClearDownload'
import undoDeleteDownloadHistory from '../eventHandlers/undoDeleteDownloadHistory'
import undoRestartingDownload from '../eventHandlers/undoRestartingDownload'
import willDownload from '../eventHandlers/willDownload'

/**
 * Sets up event listeners for the main process
 * @param {Object} params
 * @param {Object} params.appWindow Electron window instance
 * @param {Object} params.currentDownloadItems CurrentDownloadItems class instance that holds all of the active DownloadItems instances
 * @param {Object} params.database `EddDatabase` instance
 * @param {Object} params.downloadIdContext Object where we can associate a newly created download to a downloadId
 * @param {Object} params.downloadsWaitingForAuth Object where we can mark a downloadId as waiting for authentication
 */
const setupEventListeners = ({
  appWindow,
  autoUpdater,
  currentDownloadItems,
  database,
  downloadIdContext,
  downloadsWaitingForAuth,
  downloadsWaitingForEula,
  setUpdateAvailable
}) => {
  /**
   * Browser Window event listeners
   */

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

  // Show the choose download dialog
  ipcMain.on('chooseDownloadLocation', async () => {
    await chooseDownloadLocation({
      appWindow,
      database
    })
  })

  // Open the download location folder
  ipcMain.on('openDownloadFolder', async (event, info) => {
    await openDownloadFolder({
      database,
      info
    })
  })

  // Copy the download location path to the clipboard
  ipcMain.on('copyDownloadPath', async (event, info) => {
    await copyDownloadPath({
      database,
      info
    })
  })

  // Send the user to the EULA URL
  ipcMain.on('sendToEula', async (event, info) => {
    await sendToEula({
      database,
      downloadsWaitingForEula,
      info,
      webContents: appWindow.webContents
    })
  })

  // Send the user to the login URL
  ipcMain.on('sendToLogin', async (event, info) => {
    await sendToLogin({
      database,
      downloadsWaitingForAuth,
      info,
      webContents: appWindow.webContents
    })
  })

  /**
   * Preferences listeners
   */

  // Set a preferences value
  ipcMain.on('setPreferenceFieldValue', async (event, info) => {
    await setPreferenceFieldValue({
      database,
      info
    })
  })

  // Get a preferences value
  ipcMain.handle('getPreferenceFieldValue', async (event, info) => {
    const value = await getPreferenceFieldValue({
      database,
      info
    })

    return value
  })

  /**
   * Download event listeners
   */

  // New downloads listener
  appWindow.webContents.session.on('will-download', async (event, item, webContents) => {
    await willDownload({
      currentDownloadItems,
      database,
      downloadIdContext,
      downloadsWaitingForAuth,
      downloadsWaitingForEula,
      event,
      item,
      webContents
    })
  })

  // List for beginDownload to start downloading files for a downloadId
  ipcMain.on('beginDownload', async (event, info) => {
    await beginDownload({
      currentDownloadItems,
      database,
      downloadIdContext,
      info,
      webContents: appWindow.webContents
    })
  })

  // Cancel a downloadItem
  ipcMain.on('cancelDownloadItem', async (event, info) => {
    await cancelDownloadItem({
      currentDownloadItems,
      database,
      info
    })
  })

  // Cancel an errored downloadItem
  ipcMain.on('cancelErroredDownloadItem', async (event, info) => {
    await cancelErroredDownloadItem({
      currentDownloadItems,
      database,
      info
    })
  })

  // Clear a download
  ipcMain.on('clearDownload', async (event, info) => {
    await clearDownload({
      database,
      info
    })
  })

  // Clear a download form the download history by deleting it
  ipcMain.on('deleteDownloadHistory', async (event, info) => {
    await deleteDownloadHistory({
      database,
      info
    })
  })

  // Pause a downloadItem
  ipcMain.on('pauseDownloadItem', async (event, info) => {
    await pauseDownloadItem({
      currentDownloadItems,
      database,
      info
    })
  })

  // Restart a download
  ipcMain.on('restartDownload', async (event, info) => {
    await restartDownload({
      currentDownloadItems,
      database,
      downloadIdContext,
      info,
      webContents: appWindow.webContents
    })
  })

  // Resume a downloadItem
  ipcMain.on('resumeDownloadItem', async (event, info) => {
    await resumeDownloadItem({
      currentDownloadItems,
      database,
      downloadIdContext,
      info,
      webContents: appWindow.webContents
    })
  })

  // Remove a downloadItem
  ipcMain.on('deleteDownload', async (event, info) => {
    await deleteDownload({
      database,
      info
    })
  })

  // Retry and errored downloadItem
  ipcMain.on('retryErroredDownloadItem', async (event, info) => {
    await retryErroredDownloadItem({
      currentDownloadItems,
      database,
      downloadIdContext,
      info,
      webContents: appWindow.webContents
    })
  })

  // Set a download to be pending cancellation
  ipcMain.on('setCancellingDownload', async (event, info) => {
    await setCancellingDownload({
      currentDownloadItems,
      database,
      info
    })
  })

  // Set a download to be pending deletion
  ipcMain.on('setPendingDeleteDownloadHistory', async (event, info) => {
    await setPendingDeleteDownloadHistory({
      database,
      info
    })
  })

  // Set a download to be restarted
  ipcMain.on('setRestartingDownload', async (event, info) => {
    await setRestartingDownload({
      database,
      info
    })
  })

  // Undo a setCancellingDownload action
  ipcMain.on('undoCancellingDownload', async (event, info) => {
    await undoCancellingDownload({
      currentDownloadItems,
      database,
      info
    })
  })

  // Undo a clearDownload action
  ipcMain.on('undoClearDownload', async (event, info) => {
    await undoClearDownload({
      database,
      info
    })
  })

  // Undo a deleteDownloadHistory action
  ipcMain.on('undoDeleteDownloadHistory', async (event, info) => {
    await undoDeleteDownloadHistory({
      database,
      info
    })
  })

  // Undo a setRestartingDownload action
  ipcMain.on('undoRestartingDownload', async (event, info) => {
    await undoRestartingDownload({
      database,
      info
    })
  })

  /**
   * Reporting event listeners
   */

  // Called when the Downloads list needs a progress report
  ipcMain.handle('requestDownloadsProgress', async (event, info) => {
    const report = await requestDownloadsProgress({
      database,
      info
    })

    return report
  })

  // Called when the Files list needs a progress report
  ipcMain.handle('requestFilesProgress', async (event, info) => {
    const report = await requestFilesProgress({
      database,
      info
    })

    return report
  })

  /**
   * AutoUpdater event listeners
   */

  // Called when an update is available for download
  autoUpdater.on('update-available', () => {
    setUpdateAvailable(true)

    appWindow.webContents.send('autoUpdateAvailable')
  })

  // Called when there is no update available for download
  autoUpdater.on('update-not-available', async () => {
    setUpdateAvailable(false)

    // Start any pending downloads
    await startPendingDownloads({
      appWindow,
      database
    })
  })

  // Called when an error occurs with the autoUpdate
  autoUpdater.on('error', async (error) => {
    console.log(`Error in auto-updater. ${error}`)
    setUpdateAvailable(false)

    appWindow.webContents.send('autoUpdateError', error.toString())

    metricsLogger(database, {
      eventType: 'AutoUpdateFailure',
      data: {
        errorMesage: error.toString()
      }
    })

    // Start any pending downloads
    await startPendingDownloads({
      appWindow,
      database
    })
  })

  // Called when the download progress changes
  autoUpdater.on('download-progress', ({ percent }) => {
    appWindow.webContents.send('autoUpdateProgress', { percent: Math.round(percent) })
  })

  let installLater = false
  // Called when the update finishes downloading
  autoUpdater.on('update-downloaded', async () => {
    appWindow.webContents.send('autoUpdateProgress', { percent: 100 })

    // If the user already indicated they wanted to install the update later,
    // don't prompt them to install
    if (installLater) return

    // Prompt the user to install the update
    const result = dialog.showMessageBoxSync(null, {
      title: 'Update Available',
      detail: 'A new version of Earthdata Download is ready to be installed.',
      message: 'Update Available',
      buttons: ['Install now', 'Install on next launch'],
      cancelId: 1
    })

    // Install now was selected
    if (result === 0) {
      autoUpdater.quitAndInstall()
    }

    // Install on next launch was selected
    if (result === 1) {
      setUpdateAvailable(false)

      // Start any pending downloads
      await startPendingDownloads({
        appWindow,
        database
      })
    }
  })

  ipcMain.on('autoUpdateInstallLater', async () => {
    setUpdateAvailable(false)
    installLater = true

    // Start any pending downloads
    await startPendingDownloads({
      appWindow,
      database
    })
  })

  /**
   * Other listeners
   */

  // When the application finished loading, show the appWindow
  appWindow.webContents.once('did-finish-load', async () => {
    await didFinishLoad({
      appWindow,
      autoUpdater,
      database,
      setUpdateAvailable
    })
  })

  // When the window is about to close
  appWindow.on('close', async (event) => {
    // If we are in dev mode, don't worry about quitting with running downloads
    if (!app.isPackaged) return

    await beforeQuit({
      currentDownloadItems,
      database,
      event
    })
  })

  // If the appWindow was closed, quit the application
  appWindow.on('closed', () => {
    app.quit()
  })

  // When a `target=_blank` link is clicked, open in an external browser
  appWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url)

    return { action: 'deny' }
  })
}

export default setupEventListeners
