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
  const fileDownloadsProgressReport = await database.getFilesWhere({ downloadId })

  fileDownloadsProgressReport.forEach((fileDownload) => {
    const { timeStart, receivedBytes, totalBytes } = fileDownload

    const currentTime = new Date().getTime()

    const timeTaken = currentTime - timeStart

    const bytesRemaining = totalBytes - receivedBytes

    // There is a delay with the report for a specific file while its being initialized
    // Where `receivedBytes` is 0
    if (receivedBytes > 0) {
      const remainingTime = Math.ceil(((timeTaken / receivedBytes) * bytesRemaining) / 1000)
      // eslint-disable-next-line no-param-reassign
      fileDownload.remainingTime = remainingTime
    } else {
      // eslint-disable-next-line no-param-reassign
      fileDownload.remainingTime = null
    }
  })

  // Todo EDD-26 to be more performant all 3 of these SQL calls should be consolidated to a single one
  // Await SQL read from the downloads
  const downloadsProgressReport = await database.getDownloadFilesProgressByDownloadId(downloadId)
  const downloadInformation = await database.getDownloadById(downloadId)

  const downloadReport = {
    ...downloadsProgressReport,
    ...downloadInformation
  }

  webContents.send('reportFilesProgress', {
    fileDownloadsProgressReport,
    downloadReport
  })
}

export default reportFilesProgress
