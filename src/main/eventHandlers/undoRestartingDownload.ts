// @ts-nocheck

/**
 * Clears the restartId from the database
 * @param {Object} params
 * @param {Object} params.database `EddDatabase` instance
 * @param {Object} params.info `info` parameter from ipc message
 */
const undoRestartingDownload = async ({
  database,
  info
}) => {
  const {
    restartId
  } = info

  // Clear the restartId from files
  await database.updateFilesWhere({
    restartId
  }, {
    restartId: null
  })

  // Clear the restartId from downloads
  await database.updateDownloadsWhere({
    restartId
  }, {
    restartId: null
  })
}

export default undoRestartingDownload
