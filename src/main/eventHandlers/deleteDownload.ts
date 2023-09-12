// @ts-nocheck

/**
 * Deletes a download entirely.
 * @param {Object} params
 * @param {Object} params.database `EddDatabase` instance
 * @param {Object} params.info `info` parameter from ipc message
 */
const deleteDownload = async ({
  database,
  info
}) => {
  const { downloadId } = info
  if (downloadId) {
    await database.deleteDownloadById(downloadId)
  }
}

export default deleteDownload
