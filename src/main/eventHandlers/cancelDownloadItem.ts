// @ts-nocheck

import downloadStates from '../../app/constants/downloadStates'
import finishDownload from './willDownloadEvents/finishDownload'

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

    // Check to finish the download if no ongoing downloads after cancel
    // If some were cancelled but, the rest were complete allows us to put download into completed state
    await finishDownload({
      database,
      downloadId
    })
  }

  if (downloadId && !filename) {
    await database.updateDownloadById(downloadId, {
      state: downloadStates.cancelled
    })

    // Update files with downloadId which are completed and not cancelled
    await database.updateFilesWhereAndWhereNot(
      { downloadId },
      { state: downloadStates.completed },
      { state: downloadStates.cancelled }
    )
  }

  // TODO EDD-18 put the downloads into a cancelled state, clear button will move them
  if (!downloadId) {
    await database.deleteAllDownloads()
  }

  currentDownloadItems.cancelItem(downloadId, filename)
}

export default cancelDownloadItem
