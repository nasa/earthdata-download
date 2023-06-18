// @ts-nocheck

import 'array-foreach-async'

import downloadStates from '../../../app/constants/downloadStates'

/**
 * Starts the next download when a download completes
 * @param {Object} params
 * @param {Object} params.currentDownloadItems CurrentDownloadItems class instance that holds all of the active DownloadItems instances
 * @param {Object} params.database `EddDatabase` instance
 * @param {Object} params.downloadIdContext Object where we can associated a newly created download to a downloadId
 * @param {Number} params.fileId Optional file ID to start downloading
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

  // For available number of downloads, find the next `active` download with `pending` files and start downloading
  const numberDownloadsToStart = concurrentDownloads - numberOfRunningDownloads

  if (numberDownloadsToStart === 0) return

  const filesToStart = await database.getFilesToStart(numberDownloadsToStart, fileId)

  const promises = filesToStart.map(async (file) => {
    const {
      downloadId,
      id: fileId,
      url
    } = file

    const { downloadLocation } = await database.getDownloadById(downloadId)

    // The file might not actually start download before the next time through this loop
    // Setting the file to `starting` ensures we start a new file if we need to
    await database.updateFile(fileId, {
      state: downloadStates.starting
    })

    // eslint-disable-next-line no-param-reassign
    downloadIdContext[url] = {
      downloadId,
      downloadLocation,
      fileId
    }
    webContents.downloadURL(url)
  })

  await Promise.all(promises)
}

export default startNextDownload
