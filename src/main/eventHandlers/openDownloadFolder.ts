// @ts-nocheck

import { shell } from 'electron'

/**
 * Opens the download folder associated with the given download ID.
 * @param {Object} params The params object.
 * @param {Object} params.store The store object.
 * @param {String} params.info.downloadId The download ID.
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

export default openDownloadFolder
