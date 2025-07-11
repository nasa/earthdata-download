// @ts-nocheck

import downloadStates from '../../../app/constants/downloadStates'
import metricsEvent from '../../../app/constants/metricsEvent'
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

    metricsLogger(database, {
      eventType: metricsEvent.downloadComplete,
      data: {
        downloadId,
        receivedBytes: downloadStatistics.receivedBytesSum,
        totalBytes: downloadStatistics.totalBytesSum,
        duration: (downloadStatistics.totalDownloadTime / 1000).toFixed(1),
        filesDownloaded: downloadStatistics.fileCount,
        filesErrored: downloadStatistics.erroredCount,
        filesIncomplete: downloadStatistics.incompleteFileCount,
        filesInterruptedCanResume: downloadStatistics.interruptedCanResumeCount,
        filesInterruptedCanNotResume: downloadStatistics.interruptedCanNotResumeCount,
        filesCancelled: downloadStatistics.cancelledCount,
        pauseCount: downloadStatistics.pauseCount,
        duplicateCount: downloadStatistics.duplicateCount,
        invalidLinksCount: downloadStatistics.invalidLinksCount
      }
    })
  }
}

export default finishDownload
