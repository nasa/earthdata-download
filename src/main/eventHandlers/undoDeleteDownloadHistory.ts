// @ts-nocheck

/**
 * Clears the deleteId from the database
 * @param {Object} params
 * @param {Object} params.database `EddDatabase` instance
 * @param {Object} params.info `info` parameter from ipc message
 */
const undoDeleteDownloadHistory = async ({
  database,
  info
}) => {
  const { deleteId } = info

  await database.clearDeleteId(deleteId)
}

export default undoDeleteDownloadHistory
