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
  const { downloadId, name } = info

  if (downloadId) {
    await database.updateDownloadById(downloadId, {
      state: downloadStates.completed
    })
  }

  currentDownloadItems.cancelItem(downloadId, name)

  // Cancelling a download will remove it from the list of downloads
  // TODO how will this work when cancelling a granule download? I don't think we want to remove single items from a provided list of links
  if (downloadId && !name) {
    await database.deleteDownloadById(downloadId)
  }

  if (!downloadId) {
    await database.deleteAllDownloads()
  }
}

export default cancelDownloadItem
