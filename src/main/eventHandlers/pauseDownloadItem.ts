// @ts-nocheck

import downloadStates from '../../app/constants/downloadStates'

/**
 * Pauses a download and updates the database
 * @param {Object} params
 * @param {Object} params.currentDownloadItems CurrentDownloadItems class instance that holds all of the active DownloadItems instances
 * @param {Object} params.database `EddDatabase` instance
 * @param {Object} params.info `info` parameter from ipc message
 */
const pauseDownloadItem = async ({
  currentDownloadItems,
  database,
  info
}) => {
  const { downloadId, name } = info

  currentDownloadItems.pauseItem(downloadId, name)

  if (downloadId && !name) {
    await database.updateDownloadById(downloadId, {
      state: downloadStates.paused
    })
  }

  if (!downloadId) {
    await database.updateDownloadsWhereIn([
      'state',
      [downloadStates.active, downloadStates.pending]
    ], {
      state: downloadStates.paused
    })
  }
}

export default pauseDownloadItem
