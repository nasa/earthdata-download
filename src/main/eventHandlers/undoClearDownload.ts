// @ts-nocheck

/**
 * Moves a download to be active
 * @param {Object} params
 * @param {Object} params.database `EddDatabase` instance
 * @param {Object} params.info `info` parameter from ipc message
 */
const undoClearDownload = async ({
  database,
  info
}) => {
  const { clearId } = info

  await database.updateDownloadsWhere({
    clearId
  }, {
    active: true,
    clearId: null
  })
}

export default undoClearDownload
