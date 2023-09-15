// @ts-nocheck

/**
 * Updates a download to be restarting
 * @param {Object} params
 * @param {Object} params.database `EddDatabase` instance
 * @param {Object} params.info `info` parameter from ipc message
 */
const setRestartingDownload = async ({
  database,
  info
}) => {
  const {
    downloadId,
    filename,
    restartId
  } = info

  const filesUpdateWhere = {
    downloadId
  }
  if (filename) {
    filesUpdateWhere.filename = filename
  }

  // Adds the restartId to files
  await database.updateFilesWhere(filesUpdateWhere, {
    restartId
  })

  // Adds the restartId to downloads
  await database.updateDownloadById(downloadId, {
    restartId
  })
}

export default setRestartingDownload
