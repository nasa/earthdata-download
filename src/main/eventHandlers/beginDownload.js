const path = require('path')

const downloadStates = require('../../app/constants/downloadStates')

/**
 * Updates the preferences store with values for beginning a download
 * @param {Object} params
 * @param {Object} params.currentDownloadItems CurrentDownloadItems class instance that holds all of the active DownloadItems instances
 * @param {Object} params.downloadIdContext Object where we can associated a newly created download to a downloadId
 * @param {Object} params.info `info` parameter from ipc message
 * @param {Object} params.pendingDownloads Downloads that have been loaded into the app, but have not been saved in the store
 * @param {Object} params.store `electron-store` instance
 * @param {Object} params.webContents Electron BrowserWindow instance's webContents
 */
const beginDownload = ({
  currentDownloadItems,
  downloadIdContext,
  info,
  pendingDownloads,
  store,
  webContents
}) => {
  const {
    downloadIds,
    downloadLocation,
    makeDefaultDownloadLocation
  } = info

  const preferences = store.get('preferences')

  const { concurrentDownloads } = preferences

  // Update the preferences with the lastDownloadLocation, and defaultDownloadLocation if the
  // user selected this location as the default
  store.set('preferences', {
    ...preferences,
    lastDownloadLocation: downloadLocation,
    defaultDownloadLocation: makeDefaultDownloadLocation ? downloadLocation : undefined
  })

  const currentDownloadCount = currentDownloadItems.getNumberOfDownloads()
  let filesProcessedCount = 0

  downloadIds.forEach((downloadId) => {
    const { files: pendingFiles } = pendingDownloads[downloadId]
    const filesToStartDownloading = []

    const files = {}

    pendingFiles.forEach((file) => {
      const {
        url,
        name
      } = file
      const filename = url.split('/').pop()

      // Set the download to active if the number of current downloads + index is less than the concurrentDownloads limit
      const active = currentDownloadCount + filesProcessedCount < concurrentDownloads

      if (active) filesToStartDownloading.push(url)

      filesProcessedCount += 1

      // TODO possibly set timeStart for individual download if state is active?
      files[filename] = {
        name,
        url,
        state: active ? downloadStates.active : downloadStates.pending,
        percent: 0
      }
    })

    // Update this download with the downloadLocation and the timeStart
    store.set(`downloads.${downloadId}`, {
      downloadLocation: path.join(downloadLocation, downloadId),
      timeStart: new Date().getTime(),
      files,
      state: downloadStates.active
    })

    // For each URL in filesToStartDownloading, save the downloadId into the downloadIdContext, and start the download
    filesToStartDownloading.forEach((url) => {
      // eslint-disable-next-line no-param-reassign
      downloadIdContext[url] = downloadId
      webContents.downloadURL(url)
    })
  })
}

module.exports = beginDownload
