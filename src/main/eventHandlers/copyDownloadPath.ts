// @ts-nocheck

import { clipboard } from 'electron'

/**
 * Copies the file(s) downloaded path to the clipboard.
 * @param {Object} params The params object.
 * @param {Object} params.database `EddDatabase` instance
 * @param {String} params.info.downloadId The download ID.
 */
const copyDownloadPath = async ({
  database,
  info
}) => {
  const {
    downloadId
  } = info

  const { downloadLocation } = await database.getDownloadById(downloadId)

  clipboard.writeText(downloadLocation)
}

export default copyDownloadPath
