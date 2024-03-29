// @ts-nocheck

/**
 * Moves a download to be inactive
 * @param {Object} params
 * @param {Object} params.database `EddDatabase` instance
 * @param {Object} params.info `info` parameter from ipc message
 */
const clearDownload = async ({
  database,
  info
}) => {
  const {
    clearId,
    downloadId
  } = info

  await database.clearDownload(downloadId, clearId)
}

export default clearDownload
