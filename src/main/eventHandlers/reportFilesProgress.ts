// @ts-nocheck

/**
 * Reports current progress on individual files
 * @param {Object} params
 * @param {Object} params.database `EddDatabase` instance
 * @param {Object} params.webContents Electron BrowserWindow instance's webContents
 * @param {String} params.downloadId The downloadId of the file's parent download
 */
const reportFilesProgress = async ({
  database,
  webContents,
  downloadId
}) => {
  const files = await database.getFilesWhere({ downloadId })
  let totalTimeRemaining = 0
  const filesReport = files.map((fileDownload) => {
    const {
      timeStart,
      receivedBytes,
      totalBytes
    } = fileDownload

    const currentTime = new Date().getTime()

    const timeTaken = currentTime - timeStart

    const bytesRemaining = totalBytes - receivedBytes

    let remainingTime
    // There is a delay with the report for a specific file while its being initialized
    // where `receivedBytes` is 0
    if (receivedBytes > 0) {
      remainingTime = Math.ceil(((timeTaken / receivedBytes) * bytesRemaining) / 1000)
      totalTimeRemaining += remainingTime
    } else {
      remainingTime = null
    }

    return {
      ...fileDownload,
      remainingTime
    }
  })

  // TODO only return fields we need from database calls
  const downloadReport = await database.getDownloadData(downloadId)

  const {
    createdAt,
    percentSum,
    timeEnd,
    timeStart,
    totalFiles
  } = downloadReport

  let percent = 0

  if (totalFiles > 0) {
    // Round to 1 decimal place
    percent = Math.round((percentSum / totalFiles) * 10) / 10
  }

  const now = new Date().getTime()
  const lastTime = timeEnd || now
  const totalTime = Math.ceil((lastTime - (timeStart || createdAt)) / 1000)

  webContents.send('reportFilesProgress', {
    downloadReport: {
      ...downloadReport,
      totalTimeRemaining,
      percent,
      totalTime
    },
    filesReport
  })
}

export default reportFilesProgress
