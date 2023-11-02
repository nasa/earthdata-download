// @ts-nocheck

import downloadStates from '../../app/constants/downloadStates'
import metricsLogger from '../../app/logging/metricsLogger.ts'

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
  const { downloadId, filename } = info

  currentDownloadItems.pauseItem(downloadId, filename)

  metricsLogger({
    eventType: 'DownloadPause',
    data: {
      currentDownloadItems
    }
  })

  if (downloadId && filename) {
    await database.createPauseByDownloadIdAndFilename(downloadId, filename)

    await database.updateFilesWhere({
      downloadId,
      filename
    }, {
      state: downloadStates.paused
    })
  }

  if (downloadId && !filename) {
    await database.createPauseByDownloadId(downloadId, true)

    await database.updateDownloadById(downloadId, {
      state: downloadStates.paused
    })
  }

  if (!downloadId) {
    await database.createPauseForAllActiveDownloads()

    await database.updateDownloadsWhereIn([
      'state',
      [downloadStates.active, downloadStates.pending]
    ], {
      state: downloadStates.paused
    })
  }
}

export default pauseDownloadItem
