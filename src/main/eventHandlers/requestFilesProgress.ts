// @ts-nocheck

import downloadStates from '../../app/constants/downloadStates'

/**
 * Reports current progress on individual files
 * @param {Object} params
 * @param {Object} params.database `EddDatabase` instance
 * @param {Object} params.webContents Electron BrowserWindow instance's webContents
 * @param {String} params.downloadId The downloadId of the file's parent download
 */
const requestFilesProgress = async ({
  database,
  info
}) => {
  const {
    downloadId,
    limit = 10,
    offset = 0,
    hideCompleted
  } = info

  const filesReport = await database.getFilesReport({
    downloadId,
    limit,
    offset,
    hideCompleted
  })

  const headerReport = await database.getFilesHeaderReport(downloadId)

  const {
    cancelId: downloadCancelId,
    filesWithProgress,
    percentSum,
    receivedBytesSum,
    state: downloadState,
    totalTime,
    totalBytesSum,
    totalFiles
  } = headerReport

  const pausesSum = await database.getPausesSum(downloadId)

  let percent = 0

  if (totalFiles > 0) {
    // Round to 1 decimal place
    percent = Math.round((percentSum / totalFiles) * 10) / 10
  }

  const elapsedTime = totalTime - pausesSum

  const averageSizePerFile = totalBytesSum / filesWithProgress
  const estimatedTotalSize = averageSizePerFile * totalFiles

  const averageTimePerByte = elapsedTime / receivedBytesSum
  const estimatedTotalTimeRemaining = averageTimePerByte * estimatedTotalSize

  const totalFilesCount = await database.getTotalFilesPerFilesReport({
    downloadId,
    hideCompleted
  })

  const errorResults = await database.getErroredFiles()
  const errors = {}
  errorResults.forEach((error) => {
    const {
      active: erroredDownloadActive,
      downloadId: erroredDownloadId,
      numberErrors
    } = error

    errors[erroredDownloadId] = {
      active: erroredDownloadActive,
      numberErrors
    }
  })

  // If the file has been restarted, use these values
  const restartedFileProgress = {
    percent: 0,
    receivedBytes: 0,
    totalBytes: 0
  }

  const files = filesReport.map((file) => {
    const {
      cancelId,
      restartId,
      state
    } = file

    // Restarting/cancelling files aren't actually restarted/cancelled until the setTimeout expires, so while a
    // restartId/cancelId exists we need to fake a 'pending'/'cancelled' file.
    if (restartId || (cancelId && state !== downloadStates.completed)) {
      return {
        ...file,
        ...(restartId ? restartedFileProgress : {}),
        state: restartId ? downloadStates.pending : downloadStates.cancelled
      }
    }

    return file
  })

  let newDownloadState = downloadState
  if (downloadCancelId) {
    newDownloadState = downloadStates.cancelled
  }

  return {
    headerReport: {
      ...headerReport,
      elapsedTime,
      errors,
      estimatedTotalTimeRemaining,
      percent,
      state: newDownloadState
    },
    filesReport: {
      files,
      totalFiles: totalFilesCount
    }
  }
}

export default requestFilesProgress
