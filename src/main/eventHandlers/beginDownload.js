const path = require('path')

/**
 * Updates the preferences store with values for beginning a download
 * @param {Object} params
 * @param {Object} params.info `info` parameter from ipc message
 * @param {Object} params.store `electron-store` instance
 */
const beginDownload = ({
  info,
  store
}) => {
  const {
    downloadId,
    downloadLocation,
    makeDefaultDownloadLocation
  } = info

  const preferences = store.get('preferences')

  // Update the preferences with the lastDownloadLocation, and defaultDownloadLocation if the
  // user selected this location as the default
  store.set('preferences', {
    ...preferences,
    lastDownloadLocation: downloadLocation,
    defaultDownloadLocation: makeDefaultDownloadLocation ? downloadLocation : undefined
  })

  // Update this download with the downloadLocation and the timeStart
  store.set(`downloads.${downloadId}`, {
    downloadLocation: path.join(downloadLocation, downloadId),
    timeStart: new Date().getTime()
  })

  console.log('STARTING DOWNLOAD', downloadId)
}

module.exports = { beginDownload }
