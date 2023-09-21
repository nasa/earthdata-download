// @ts-nocheck

import 'array-foreach-async'

/**
 * Clears the cancelId from the database
 * @param {Object} params
 * @param {Object} params.currentDownloadItems CurrentDownloadItems class instance that holds all of the active DownloadItems instances
 * @param {Object} params.database `EddDatabase` instance
 * @param {Object} params.info `info` parameter from ipc message
 */
const undoCancellingDownload = async ({
  currentDownloadItems,
  database,
  info
}) => {
  const {
    downloadId,
    filename,
    cancelId
  } = info

  // Resume downloading the file
  currentDownloadItems.resumeItem(downloadId, filename)

  // End the pause for the download/file
  if (downloadId) {
    await database.endPause(downloadId, filename)
  }

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

  // If no downloadId was given, end the pause for all active downloads
  if (!downloadId) {
    const downloads = await database.getAllDownloadsWhere({ active: true })

    await downloads.forEachAsync(async (download) => {
      const { id } = download

      await database.endPause(id)
    })
  }
}

export default undoCancellingDownload
