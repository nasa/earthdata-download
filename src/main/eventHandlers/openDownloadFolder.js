const { shell } = require('electron')

/**
 * Opens the download folder associated with the given download ID.
 * @param {Object} params The params object.
 * @param {Object} params.store The store object.
 * @param {string} params.info.downloadId The download ID.
 */
const openDownloadFolder = ({
  info,
  store
}) => {
  const {
    downloadId
  } = info

  const folderPath = store.get(`downloads.${downloadId}.downloadLocation`)
  shell.openPath(folderPath)
}

module.exports = openDownloadFolder
