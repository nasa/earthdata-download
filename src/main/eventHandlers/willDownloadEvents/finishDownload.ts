// @ts-nocheck

import downloadStates from '../../../app/constants/downloadStates'
import metricsLogger from '../../utils/metricsLogger'

/**
 * If no more files are not completed, mark the download as completed
 * @param {Object} params
 * @param {Object} params.database `EddDatabase` instance
 * @param {Object} params.downloadId downloadId of the DownloadItem being downloaded
 */
const finishDownload = async ({
  database,
  downloadId
}) => {
  const notCompleteFilesCount = await database.getNotCompletedFilesCountByDownloadId(downloadId)
  if (notCompleteFilesCount === 0) {
    await database.updateDownloadById(downloadId, {
      timeEnd: new Date().getTime(),
      state: downloadStates.completed
    })

    const downloadStatistics = await database.getDownloadStatistics(downloadId)

    metricsLogger({
      eventType: 'DownloadComplete',
      data: {
        downloadId,
        receivedBytes: downloadStatistics.receivedBytesSum,
        totalBytes: downloadStatistics.totalBytesSum,
        duration: (downloadStatistics.totalDownloadTime / 1000).toFixed(1),
        filesDownloaded: downloadStatistics.fileCount,
        filesFailed: downloadStatistics.incompleteFileCount
      }
    })
  }
}

export default finishDownload
