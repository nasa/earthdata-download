// @ts-nocheck

import downloadStates from '../../../app/constants/downloadStates'

/**
 * Starts the next download when a download completes
 * @param {Object} params
 * @param {Object} params.currentDownloadItems CurrentDownloadItems class instance that holds all of the active DownloadItems instances
 * @param {String} params.downloadId downloadId of the DownloadItem being downloaded
 * @param {Object} params.downloadIdContext Object where we can associated a newly created download to a downloadId
 * @param {Object} params.store `electron-store` instance
 * @param {Object} params.webContents Electron BrowserWindow instance's webContents
 */
const startNextDownload = ({
  currentDownloadItems,
  downloadId,
  downloadIdContext,
  store,
  webContents
}) => {
  // Get the concurrentDownloads from preferences
  const concurrentDownloads = store.get('preferences.concurrentDownloads')

  // Get number of running downloads
  const numberOfRunningDownloads = currentDownloadItems.getNumberOfDownloads()

  // For available number of downloads, find the next `active` download with `pending` files and start downloading
  let numberDownloadsToStart = concurrentDownloads - numberOfRunningDownloads

  while (numberDownloadsToStart > 0) {
    const allDownloads = store.get('downloads')

    const activeDownloadIds = Object.keys(allDownloads)
      // eslint-disable-next-line arrow-body-style
      .filter((nextDownloadId) => allDownloads[nextDownloadId].state === downloadStates.active)

    if (activeDownloadIds.length === 0) return

    let startedFile = false

    // Find the next pending file within all active downloads
    activeDownloadIds.forEach((activeDownloadId) => {
      // If a file has already been started in this loop, don't look for another file to start
      if (startedFile) return

      const { files: nextActiveDownloadFiles } = allDownloads[activeDownloadId]
      const nextActiveDownloadPendingFile = Object.entries(nextActiveDownloadFiles)
        .find(([, values]) => values.state === downloadStates.pending)

      // If a pending file was found, start it downloading
      if (nextActiveDownloadPendingFile) {
        const [nextFilename] = nextActiveDownloadPendingFile
        const { url } = nextActiveDownloadFiles[nextFilename]

        store.set(`downloads.${activeDownloadId.replaceAll('.', '\\.')}.files.${nextFilename.replaceAll('.', '\\.')}.state`, downloadStates.active)

        // eslint-disable-next-line no-param-reassign
        downloadIdContext[url] = activeDownloadId.replaceAll('.', '\\.')
        webContents.downloadURL(url)

        startedFile = true
      } else {
        const nextNotCompletedFile = Object.entries(nextActiveDownloadFiles)
          .find(([, values]) => values.state !== downloadStates.completed)

        // If no more files in the download are not completed, set the timeEnd and state for the download in the store
        if (!nextNotCompletedFile) {
          const storeDownload = store.get(`downloads.${downloadId}`)
          store.set(`downloads.${downloadId}`, {
            ...storeDownload,
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
}

export default startNextDownload
