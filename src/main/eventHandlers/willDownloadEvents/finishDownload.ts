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

    const [
      fileCount,
      receivedBytes,
      totalBytes,
      downloadDuration
    ] = await Promise.all([
      database.getFileCountWhere({ downloadId }),
      database.getReceivedBytesSumByDownloadId(downloadId),
      database.getTotalBytesSumByDownloadId(downloadId),
      database.getTotalDownloadTimeByDownloadId(downloadId)
    ])
    metricsLogger({
      eventType: 'DownloadComplete',
      data: {
        downloadId,
        receivedBytes,
        totalBytes,
        duration: (downloadDuration / 1000).toFixed(1),
        filesDownloaded: fileCount,
        filesFailed: notCompleteFilesCount
      }
    })
  }
}

export default finishDownload
