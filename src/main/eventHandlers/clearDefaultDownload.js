const { app } = require('electron')

/**
 * Clears the default download from the user preferences
 * !! This was only made as an example and for testing, the included logic might not be what we want in the final version
 * @param {Object} params
 * @param {String} params.downloadId ID for the download being initialized
 * @param {Object} params.store `electron-store` instance
 * @param {Object} params.window Electron window instance
 */
const clearDefaultDownload = ({
  downloadId,
  store,
  window
}) => {
  const preferences = store.get('preferences')

  // Remove the defaultDownloadLocation from the store
  store.set('preferences', {
    ...preferences,
    defaultDownloadLocation: undefined
  })

  // Initialize a new download to see the store has been updated and the default is gone (this doesn't make sense for the final version)
  let location = app.getPath('downloads')

  const {
    lastDownloadLocation
  } = preferences

  if (lastDownloadLocation) {
    location = lastDownloadLocation
  }

  window.webContents.send('initializeDownload', {
    downloadId,
    downloadLocation: location,
    shouldUseDefaultLocation: false
  })
}

module.exports = { clearDefaultDownload }
