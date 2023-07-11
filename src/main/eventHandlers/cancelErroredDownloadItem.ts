// @ts-nocheck

import downloadStates from '../../app/constants/downloadStates'
import finishDownload from './willDownloadEvents/finishDownload'

/**
 * Cancels an errored download and updates the database state
 * @param {Object} params
 * @param {Object} params.currentDownloadItems CurrentDownloadItems class instance that holds all of the active DownloadItems instances
 * @param {Object} params.database `EddDatabase` instance
 * @param {Object} params.info `info` parameter from ipc message
 */
const cancelErroredDownloadItem = async ({
  currentDownloadItems,
  database,
  info
}) => {
  const { downloadId, filename } = info

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
    await database.updateFilesWhere({
      downloadId,
      state: downloadStates.error
    }, {
      state: downloadStates.cancelled
    })
  }

  // Finish the download
  await finishDownload({
    database,
    downloadId
  })
}

export default cancelErroredDownloadItem
