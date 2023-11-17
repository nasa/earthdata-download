// @ts-nocheck

import downloadStates from '../../app/constants/downloadStates'

/**
 * Adds a deleteId to the database
 * @param {Object} params
 * @param {Object} params.currentDownloadItems CurrentDownloadItems class instance that holds all of the active DownloadItems instances
 * @param {Object} params.database `EddDatabase` instance
 * @param {Object} params.info `info` parameter from ipc message
 */
const setCancellingDownload = async ({
  currentDownloadItems,
  database,
  info
}) => {
  const {
    downloadId,
    filename,
    cancelId
  } = info

  // Pause the download
  currentDownloadItems.pauseItem(downloadId, filename)

  // Create a pause if the downloadId and filename exist
  if (downloadId && filename) {
    await database.createPauseByDownloadIdAndFilename(downloadId, filename)
  }

  // Create a pause if only the downloadId exists
  if (downloadId && !filename) {
    await database.createPauseByDownloadId(downloadId, true)
  }

  if (downloadId) {
    const filesUpdateWhere = {
      downloadId
    }
    if (filename) {
      filesUpdateWhere.filename = filename
    }

    // Add the cancelId to files
    await database.updateFilesWhere(filesUpdateWhere, {
      cancelId
    })

    // Add the cancelId to downloads
    await database.updateDownloadById(downloadId, {
      cancelId
    })
  }

  if (!downloadId) {
    // If no downloadId was given, add a pause for all active downloads
    await database.createPauseForAllActiveDownloads()

    // Add the cancelId to all active downloads
    const updatedDownloads = await database.updateDownloadsWhereAndWhereNotIn({
      active: true
    }, [
      'state',
      [downloadStates.completed, downloadStates.cancelled]
    ], {
      cancelId
    })

    // Add the cancelId to each updated download's files
    await Promise.all(updatedDownloads.map(async (updatedDownload) => {
      const { id } = updatedDownload

      await database.updateFilesWhere({ downloadId: id }, {
        cancelId
      })
    }))
  }
}

export default setCancellingDownload
