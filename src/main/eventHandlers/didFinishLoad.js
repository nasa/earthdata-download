const { app } = require('electron')

/**
 * Opens the electron open dialog to choose a download location
 * @param {Object} params
 * @param {String} params.downloadId ID for the download being initialized
 * @param {Object} params.store `electron-store` instance
 * @param {Object} params.window Electron window instance
 */
const didFinishLoad = ({
  downloadIds = [],
  store,
  window
}) => {
  // TODO downloadId might need to be generated here once we are getting a context value from EDSC

  if (downloadIds.length > 0) {
    // Default the download location to the user's `downloads` foler
    let location = app.getPath('downloads')

    // Pull preferences out of the store
    const preferences = store.get('preferences')
    const {
      defaultDownloadLocation,
      lastDownloadLocation
    } = preferences

    // If there is a lastDownloadLocation, use that location
    if (lastDownloadLocation) {
      location = lastDownloadLocation
    }

    // If there is a defaultDownloadLocation, use that location
    if (defaultDownloadLocation) {
      location = defaultDownloadLocation
    }

    // Send a message to the renderer to initialize the download
    window.webContents.send('initializeDownload', {
      downloadIds,
      downloadLocation: location,
      shouldUseDefaultLocation: !!defaultDownloadLocation
    })
  }

  // Show the electron app window
  window.show()

  // Open the DevTools if running in development.
  if (!app.isPackaged) window.webContents.openDevTools({ mode: 'detach' })
}

module.exports = didFinishLoad
