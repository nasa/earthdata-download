// @ts-nocheck

import downloadStates from '../../app/constants/downloadStates'
import metricsLogger from '../utils/metricsLogger'

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

    metricsLogger({
      eventType: 'DownloadPause',
      data: {
        downloadIds: [downloadId],
        downloadCount: 1
      }
    })
  }

  if (!downloadId) {
    const pauseResponse = await database.createPauseForAllActiveDownloads()

    await database.updateDownloadsWhereIn([
      'state',
      [downloadStates.active, downloadStates.pending]
    ], {
      state: downloadStates.paused
    })

    metricsLogger({
      eventType: 'DownloadPause',
      data: {
        downloadIds: pauseResponse[2],
        downloadCount: pauseResponse[1]
      }
    })
  }
}

export default pauseDownloadItem
