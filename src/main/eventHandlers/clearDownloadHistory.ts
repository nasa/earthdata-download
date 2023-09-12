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
  const { downloadId = '' } = info

  if (downloadId.length > 0) {
    database.clearDownloadHistoryDownloads(downloadId)

    return
  }

  // Clear all the downloads in the history
  await database.clearDownloadHistoryDownloads()
}

export default clearDownloadHistory
