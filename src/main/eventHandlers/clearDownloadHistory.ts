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
  // TODO we should be able to clear individual items from the download history with a button to the actions bar
  console.log('🚀 ~ file: clearDownloadHistory.ts:14 ~ info:', info)
  const { downloadId = '' } = info
  console.log('🚀 ~ file: clearDownloadHistory.ts:14 ~ downloadId:', downloadId)

  if (downloadId.length > 0) {
    database.clearDownloadHistoryDownloads(downloadId)

    return
  }

  // Clear all the downloads in the history
  await database.clearDownloadHistoryDownloads()
}

export default clearDownloadHistory
