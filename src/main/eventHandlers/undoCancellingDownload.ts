// @ts-nocheck

/**
 * Clears the cancelId from the database
 * @param {Object} params
 * @param {Object} params.database `EddDatabase` instance
 * @param {Object} params.info `info` parameter from ipc message
 */
const undoCancellingDownload = async ({
  database,
  info
}) => {
  const {
    cancelId
  } = info

  // Clear the cancelId from files
  await database.updateFilesWhere({
    cancelId
  }, {
    cancelId: null
  })

  // Clear the cancelId from downloads
  await database.updateDownloadsWhere({
    cancelId
  }, {
    cancelId: null
  })
}

export default undoCancellingDownload
