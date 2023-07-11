// @ts-nocheck

import downloadStates from '../../app/constants/downloadStates'

/**
 * Cancels a download and updates the database state
 * @param {Object} params
 * @param {Object} params.currentDownloadItems CurrentDownloadItems class instance that holds all of the active DownloadItems instances
 * @param {Object} params.database `EddDatabase` instance
 * @param {Object} params.info `info` parameter from ipc message
 */
const cancelDownloadItem = async ({
  currentDownloadItems,
  database,
  info
}) => {
  const { downloadId, filename } = info
  console.log('🚀 ~ file: cancelDownloadItem.ts:18 ~ info:', info)

  currentDownloadItems.cancelItem(downloadId, filename)

  if (downloadId && filename) {
    await database.updateFilesWhere({
      downloadId,
      filename
    }, {
      state: downloadStates.cancelled
    })
  }

  if (downloadId && !filename) {
    // TODO EDD-30 also put all files into cancelled?
    await database.updateDownloadById(downloadId, {
      state: downloadStates.cancelled
    })
    await database.updateFilesWhere({
      downloadId,
      // TODO this doesn't specifally say cancel errored downloads, this might need a more specific event
      state: downloadStates.error
    }, {
      state: downloadStates.cancelled
    })
  }

  // TODO EDD-30 put the downloads into a cancelled state
  if (!downloadId) {
    await database.deleteAllDownloads()
  }
}

export default cancelDownloadItem
