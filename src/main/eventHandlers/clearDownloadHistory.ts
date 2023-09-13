// @ts-nocheck

/**
 * Removes downloads in the download history from the database
 * @param {Object} params
 * @param {Object} params.database `EddDatabase` instance
 * @param {Object} params.info `info` parameter from ipc message
 */
const clearDownloadHistory = async ({
  database,
  info
}) => {
  const { downloadId } = info

  // Clear the download(s) in the history
  await database.clearDownloadHistoryDownloads(downloadId)
}

export default clearDownloadHistory
