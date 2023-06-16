// @ts-nocheck

import { shell } from 'electron'

/**
 * Opens the download folder associated with the given download ID.
 * @param {Object} params The params object.
 * @param {Object} params.database `EddDatabase` instance
 * @param {String} params.info.downloadId The download ID.
 */
const openDownloadFolder = async ({
  database,
  info
}) => {
  const {
    downloadId
  } = info

  const { downloadLocation } = await database.getDownloadById(downloadId)

  shell.openPath(downloadLocation)
}

export default openDownloadFolder
