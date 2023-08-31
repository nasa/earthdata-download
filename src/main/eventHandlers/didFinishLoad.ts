// @ts-nocheck

import { app } from 'electron'

import startPendingDownloads from '../utils/startPendingDownloads'

import downloadStates from '../../app/constants/downloadStates'

/**
 * Opens the app window. Resets any active downloads/files so they can be resumed.
 * @param {Object} params
 * @param {Object} params.appWindow Electron window instance
 * @param {Object} params.autoUpdater `electron-updater` instance
 * @param {Object} params.database `EddDatabase` instance
 * @param {Function} params.setUpdateAvailable A function to set if an auto update download is available
 */
const didFinishLoad = async ({
  appWindow,
  autoUpdater,
  database,
  setUpdateAvailable
}) => {
  // Show the electron appWindow
  appWindow.show()

  // Update any active files to pending, so they can be restarted
  await database.updateFilesWhere({
    state: downloadStates.active
  }, {
    state: downloadStates.pending,
    percent: 0,
    timeStart: null,
    timeEnd: null,
    errors: null,
    receivedBytes: null,
    totalBytes: null
  })

  // Update any active downloads to paused, so they can be resumed
  await database.updateDownloadsWhereIn([
    'state',
    [downloadStates.active]
  ], {
    state: downloadStates.paused
  })

  // Open the DevTools if running in development.
  if (!app.isPackaged) appWindow.webContents.openDevTools({ mode: 'detach' })

  await autoUpdater.checkForUpdates()

  // Locally, start pending downloads unless `forceDevUpdateConfig` is enabled
  if (!app.isPackaged && !autoUpdater.forceDevUpdateConfig) {
    setUpdateAvailable(false)

    // Start any pending downloads
    await startPendingDownloads({
      appWindow,
      database
    })
  }
}

export default didFinishLoad
