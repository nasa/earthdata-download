// @ts-nocheck

/**
 * Removes rows from the database that match the deleteId
 * @param {Object} params
 * @param {Object} params.database `EddDatabase` instance
 * @param {Object} params.info `info` parameter from ipc message
 */
const deleteDownloadHistory = async ({
  database,
  info
}) => {
  const {
    deleteId
  } = info

  // Clear the download(s) in the history
  await database.deleteByDeleteId(deleteId)
}

export default deleteDownloadHistory
