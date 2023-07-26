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

  if (downloadId && filename) {
    await database.updateFilesWhere({
      downloadId,
      filename
    }, {
      state: downloadStates.cancelled
    })
  }

  if (downloadId && !filename) {
    // await database.updateFilesWhere({
    //   downloadId
    // }, {
    //   state: downloadStates.cancelled
    // })

    await database.updateDownloadById(downloadId, {
      state: downloadStates.cancelled
    })
  }

  // TODO EDD-30 put the downloads into a cancelled state
  if (!downloadId) {
    await database.deleteAllDownloads()
  }

  currentDownloadItems.cancelItem(downloadId, filename)
}

export default cancelDownloadItem
