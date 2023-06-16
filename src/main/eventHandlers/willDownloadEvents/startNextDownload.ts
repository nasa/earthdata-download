// @ts-nocheck

import 'array-foreach-async'

import downloadStates from '../../../app/constants/downloadStates'

/**
 * Starts the next download when a download completes
 * @param {Object} params
 * @param {Object} params.currentDownloadItems CurrentDownloadItems class instance that holds all of the active DownloadItems instances
 * @param {Object} params.database `EddDatabase` instance
 * @param {String} params.downloadId downloadId of the DownloadItem being downloaded
 * @param {Object} params.downloadIdContext Object where we can associated a newly created download to a downloadId
 * @param {Object} params.webContents Electron BrowserWindow instance's webContents
 */
const startNextDownload = async ({
  currentDownloadItems,
  database,
  downloadIdContext,
  webContents
}) => {
  // Get the concurrentDownloads from preferences
  const { concurrentDownloads } = await database.getPreferences()

  // Get number of running downloads
  const numberOfRunningDownloads = currentDownloadItems.getNumberOfDownloads()

  // For available number of downloads, find the next `active` download with `pending` files and start downloading
  let numberDownloadsToStart = concurrentDownloads - numberOfRunningDownloads

  // https://eslint.org/docs/latest/rules/no-await-in-loop#when-not-to-use-it
  /* eslint-disable no-await-in-loop */
  while (numberDownloadsToStart > 0) {
    const activeDownloads = await database.getDownloadsWhere({
      state: downloadStates.active
    })

    if (activeDownloads.length === 0) return

    let startedFile = false

    // Find the next pending file within all active downloads
    await activeDownloads.forEachAsync(async (activeDownload) => {
      // If a file has already been started in this loop, don't look for another file to start
      if (startedFile) return

      const { id: activeDownloadId, downloadLocation } = activeDownload
      const nextActiveDownloadPendingFiles = await database.getFilesWhere({
        downloadId: activeDownloadId,
        state: downloadStates.pending
      })

      // If a pending file was found, start it downloading
      if (nextActiveDownloadPendingFiles.length > 0) {
        const [nextActiveDownloadPendingFile] = nextActiveDownloadPendingFiles
        const {
          id: fileId,
          url
        } = nextActiveDownloadPendingFile

        // The file might not actually start download before the next time through this loop
        // Setting the file to `starting` ensures we start a new file if we need to
        await database.updateFile(fileId, {
          state: downloadStates.starting
        })

        // eslint-disable-next-line no-param-reassign
        downloadIdContext[url] = {
          downloadId: activeDownloadId,
          downloadLocation,
          fileId
        }
        webContents.downloadURL(url)

        startedFile = true
      } else {
        const nextActiveNotCompletedFiles = await database.getNotCompletedFilesByDownloadId(
          activeDownloadId
        )

        // If no more files in the download are not completed, set the timeEnd and state for the download in the database
        if (nextActiveNotCompletedFiles.length === 0) {
          await database.updateDownloadById(activeDownloadId, {
            timeEnd: new Date().getTime(),
            state: downloadStates.completed
          })
        }
      }
    })

    // If a file was started, decrement the number of downloads we still need to start
    if (startedFile) {
      numberDownloadsToStart -= 1
    } else {
      // If a file was not started, set numberDownloadsToStart to 0 to stop the loop
      numberDownloadsToStart = 0
    }
  }
  /* eslint-enable no-await-in-loop */
}

export default startNextDownload
