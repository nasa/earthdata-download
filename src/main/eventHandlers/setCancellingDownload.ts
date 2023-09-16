// @ts-nocheck

/**
 * Adds a deleteId to the database
 * @param {Object} params
 * @param {Object} params.database `EddDatabase` instance
 * @param {Object} params.info `info` parameter from ipc message
 */
const setCancellingDownload = async ({
  database,
  info
}) => {
  const {
    downloadId,
    filename,
    cancelId
  } = info

  const filesUpdateWhere = {
    downloadId
  }
  if (filename) {
    filesUpdateWhere.filename = filename
  }

  // Adds the cancelId to files
  await database.updateFilesWhere(filesUpdateWhere, {
    cancelId
  })

  // Adds the cancelId to downloads
  await database.updateDownloadById(downloadId, {
    cancelId
  })
}

export default setCancellingDownload
