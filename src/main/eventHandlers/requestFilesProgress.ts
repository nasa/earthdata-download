// @ts-nocheck

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
    createdAt,
    filesWithProgress,
    percentSum,
    receivedBytesSum,
    timeEnd,
    timeStart,
    totalBytesSum,
    totalFiles
  } = headerReport

  let percent = 0

  if (totalFiles > 0) {
    // Round to 1 decimal place
    percent = Math.round((percentSum / totalFiles) * 10) / 10
  }

  const now = new Date().getTime()
  const lastTime = timeEnd || now
  const elapsedTime = Math.ceil((lastTime - (timeStart || createdAt)) / 1000)

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
      downloadId: erroredDownloadId,
      numberErrors
    } = error
    errors[erroredDownloadId] = { numberErrors }
  })

  return {
    headerReport: {
      ...headerReport,
      errors,
      percent,
      elapsedTime,
      estimatedTotalTimeRemaining
    },
    filesReport: {
      files: filesReport,
      totalFiles: totalFilesCount
    }
  }
}

export default requestFilesProgress
