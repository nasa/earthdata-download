// @ts-nocheck

import { clipboard } from 'electron'

/**
 * Copies the file(s) downloaded path to the clipboard.
 * @param {Object} params The params object.
 * @param {Object} params.store The store object.
 * @param {String} params.info.downloadId The download ID.
 */
const copyDownloadPath = ({
  info,
  store
}) => {
  const {
    downloadId
  } = info

  const folderPath = store.get(`downloads.${downloadId}.downloadLocation`)
  clipboard.writeText(folderPath)
}

export default copyDownloadPath
