const downloadStates = require('../../../app/constants/downloadStates')

/**
 * Starts the next download when a download completes
 * @param {Object} params
 * @param {String} params.downloadId downloadId of the DownloadItem being downloaded
 * @param {Object} params.downloadIdContext Object where we can associated a newly created download to a downloadId
 * @param {Object} params.store `electron-store` instance
 * @param {Boolean} params.wasCancelled Was the previous file cancelled
 * @param {Object} params.webContents Electron BrowserWindow instance's webContents
 */
const startNextDownload = ({
  downloadId,
  downloadIdContext,
  store,
  wasCancelled,
  webContents
}) => {
  let nextFile

  // If the item wasn't cancelled, find the next pending file in the download to start
  console.log('🚀 ~ file: startNextDownload.js:23 ~ wasCancelled:', wasCancelled)
  if (!wasCancelled) {
    // Get all files from the current download
    const allFiles = store.get(`downloads.${downloadId}.files`)

    console.log('🚀 ~ file: startNextDownload.js:26 ~ allFiles:', allFiles)
    // Get the next file that is pending
    nextFile = Object.entries(allFiles)
      .find(([, values]) => values.state === downloadStates.pending)
    console.log('🚀 ~ file: startNextDownload.js:30 ~ nextFile:', nextFile)

    // If there is another file still in pending, start downloading it
    if (nextFile) {
      const [nextFilename] = nextFile
      const { url } = allFiles[nextFilename]

      // eslint-disable-next-line no-param-reassign
      downloadIdContext[url] = downloadId
      webContents.downloadURL(url)
    } else {
      // Find the next file in the download that has not completed
      const nextNotCompletedFile = Object.entries(allFiles)
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
  }

  // If the item was cancelled, or there are no more pending files in the download, find the next active download with pending files to start
  // TODO if all the files were cancelled, this needs to trigger more downloads
  if (wasCancelled || !nextFile) {
    const allDownloads = store.get('downloads')
    const nextActiveDownloadId = Object.keys(allDownloads)
      // eslint-disable-next-line arrow-body-style
      .find((nextDownloadId) => {
        return downloadId !== nextDownloadId
        && allDownloads[nextDownloadId].state === downloadStates.active
      })

    if (!nextActiveDownloadId) return

    const nextActiveDownloadFiles = allDownloads[nextActiveDownloadId].files
    const nextActiveDownloadPendingFile = Object.entries(nextActiveDownloadFiles)
      .find(([, values]) => values.state === downloadStates.pending)

    if (nextActiveDownloadPendingFile) {
      const [nextFilename] = nextActiveDownloadPendingFile
      const { url } = nextActiveDownloadFiles[nextFilename]

      // eslint-disable-next-line no-param-reassign
      downloadIdContext[url] = nextActiveDownloadId
      webContents.downloadURL(url)
    }
  }
}

module.exports = startNextDownload
