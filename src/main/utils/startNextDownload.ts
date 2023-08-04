// @ts-nocheck

import 'array-foreach-async'

import downloadFile from './downloadFile'

import downloadStates from '../../app/constants/downloadStates'

/**
 * Starts the next download when a download completes
 * @param {Object} params
 * @param {Object} params.currentDownloadItems CurrentDownloadItems class instance that holds all of the active DownloadItems instances
 * @param {Object} params.database `EddDatabase` instance
 * @param {Object} params.downloadIdContext Object where we can associate a newly created download to a downloadId
 * @param {String} params.fileId Optional file ID to start downloading
 * @param {Object} params.webContents Electron BrowserWindow instance's webContents
 */
const startNextDownload = async ({
  currentDownloadItems,
  database,
  downloadIdContext,
  fileId,
  webContents
}) => {
  // Get the concurrentDownloads from preferences
  const { concurrentDownloads } = await database.getPreferences()

  // Get number of running downloads
  const numberOfRunningDownloads = currentDownloadItems.getNumberOfDownloads()

  // Get the number of files starting to download
  const numberOfStartingDownloads = await database.getFileCountWhere({
    state: downloadStates.starting
  })

  // For available number of downloads, find the next `active` download with `pending` files and start downloading
  const numberDownloadsToStart = concurrentDownloads
    - numberOfStartingDownloads
    - numberOfRunningDownloads

  if (numberDownloadsToStart < 1) return

  const filesToStart = await database.getFilesToStart(numberDownloadsToStart, fileId)

  const promises = filesToStart.map(async (file) => {
    await downloadFile({
      database,
      downloadIdContext,
      file,
      webContents
    })
  })

  await Promise.all(promises)
}

export default startNextDownload
