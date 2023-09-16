// @ts-nocheck

import downloadStates from '../../app/constants/downloadStates'

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

  if (downloadId) {
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

  if (!downloadId) {
    const updatedDownloads = await database.updateDownloadsWhereAndWhereNotIn({
      active: true
    }, [
      'state',
      [downloadStates.completed, downloadStates.cancelled]
    ], {
      cancelId
    })

    await Promise.all(updatedDownloads.map(async (updatedDownload) => {
      const { id } = updatedDownload

      await database.updateFilesWhere({ downloadId: id }, {
        cancelId
      })
    }))
  }
}

export default setCancellingDownload
