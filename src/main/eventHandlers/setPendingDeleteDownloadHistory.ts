// @ts-nocheck

/**
 * Adds a deleteId to the database
 * @param {Object} params
 * @param {Object} params.database `EddDatabase` instance
 * @param {Object} params.info `info` parameter from ipc message
 */
const setPendingDeleteDownloadHistory = async ({
  database,
  info
}) => {
  const {
    downloadId,
    deleteId
  } = info

  // Clear the download(s) in the history
  await database.addDeleteId(downloadId, deleteId)
}

export default setPendingDeleteDownloadHistory
