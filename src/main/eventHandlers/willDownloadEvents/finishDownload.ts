// @ts-nocheck

import downloadStates from '../../../app/constants/downloadStates'
import metricsLogger from '../../../app/logging/metricsLogger.ts'

/**
 * If no more files are not completed, mark the download as completed
 * @param {Object} params
 * @param {Object} params.database `EddDatabase` instance
 * @param {Object} params.downloadId downloadId of the DownloadItem being downloaded
 */
const finishDownload = async ({
  database,
  downloadId,
  item
}) => {
  const notCompleteFilesCount = await database.getNotCompletedFilesCountByDownloadId(downloadId)
  if (notCompleteFilesCount === 0) {
    await database.updateDownloadById(downloadId, {
      timeEnd: new Date().getTime(),
      state: downloadStates.completed
    })

    metricsLogger({
      eventType: 'DownloadComplete',
      data: {
        downloadId,
        receivedBytes: item.getReceivedBytes(),
        totalBytes: item.getTotalBytes(),
        duration: ((Date.now() / 1000) - item.getStartTime()).toFixed(1)
      }
    })
  }
}

export default finishDownload
