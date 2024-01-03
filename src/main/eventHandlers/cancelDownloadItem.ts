// @ts-nocheck

import downloadStates from '../../app/constants/downloadStates'
import finishDownload from './willDownloadEvents/finishDownload'
import metricsLogger from '../utils/metricsLogger'
import downloadIdForMetrics from '../utils/downloadIdForMetrics'

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
  const {
    downloadId,
    filename
  } = info

  currentDownloadItems.cancelItem(downloadId, filename)

  if (downloadId && filename) {
    await database.updateFilesWhere({
      downloadId,
      filename
    }, {
      cancelId: null,
      state: downloadStates.cancelled
    })

    // Check to finish the download if no ongoing downloads after cancel
    // If some were cancelled but, the rest were complete allows us to put download into completed state
    await finishDownload({
      database,
      downloadId
    })

    metricsLogger(database, {
      eventType: 'DownloadItemCancel',
      data: {
        downloadId: downloadIdForMetrics(downloadId)
      }
    })
  }

  if (downloadId && !filename) {
    await database.updateDownloadById(downloadId, {
      state: downloadStates.cancelled,
      timeEnd: new Date().getTime()
    })

    // Update files with downloadId which are completed and not cancelled
    await database.updateFilesWhereAndWhereNot(
      { downloadId },
      { state: downloadStates.completed },
      {
        cancelId: null,
        state: downloadStates.cancelled
      }
    )

    await database.endPause(downloadId)

    metricsLogger(database, {
      eventType: 'DownloadCancel',
      data: {
        downloadIds: [downloadIdForMetrics(downloadId)],
        cancelCount: 1
      }
    })
  }

  if (!downloadId) {
    // Cancel all active downloads
    const updatedDownloads = await database.updateDownloadsWhereAndWhereNotIn({
      active: true
    }, [
      'state',
      [downloadStates.completed, downloadStates.cancelled]
    ], {
      cancelId: null,
      state: downloadStates.cancelled,
      timeEnd: new Date().getTime()
    })

    const cancelledDownloadIds = []
    await Promise.all(updatedDownloads.map(async (updatedDownload) => {
      const { id } = updatedDownload
      cancelledDownloadIds.push(downloadIdForMetrics(id))
      await database.endPause(id)
    }))

    metricsLogger(database, {
      eventType: 'DownloadCancel',
      data: {
        downloadIds: cancelledDownloadIds,
        cancelCount: cancelledDownloadIds.length
      }
    })
  }
}

export default cancelDownloadItem
