// @ts-nocheck

/**
 * Reports current progress on downloads
 * @param {Object} params
 * @param {Object} params.database `EddDatabase` instance
 * @param {Object} params.webContents Electron BrowserWindow instance's webContents
 */
const requestDownloadsProgress = async ({
  database,
  info
}) => {
  const {
    limit = 10,
    offset = 0
  } = info

  const totalDownloads = await database.getAllDownloadsCount()

  if (totalDownloads === 0) {
    return {
      downloadsReport: [],
      totalDownloads
    }
  }

  // Pull download status for each download in the database
  const downloads = await database.getDownloadsReport(limit, offset)

  const promises = downloads.map(async (download) => {
    const {
      createdAt,
      id: downloadId,
      loadingMoreFiles,
      state,
      timeEnd,
      timeStart
    } = download

    const {
      percentSum,
      totalFiles,
      finishedFiles
    } = await database.getDownloadReport(downloadId)

    let percent = 0

    if (totalFiles > 0) {
      // Round to 1 decimal place
      percent = Math.round((percentSum / totalFiles) * 10) / 10
    }

    const now = new Date().getTime()

    const lastTime = timeEnd || now

    const totalTime = Math.ceil((lastTime - (timeStart || createdAt)) / 1000)

    const progress = {
      percent,
      finishedFiles,
      totalFiles,
      totalTime
    }

    return {
      downloadId,
      // Sqlite booleans are actually integers 1/0
      loadingMoreFiles: loadingMoreFiles === 1,
      progress,
      state
    }
  })

  const downloadsReport = await Promise.all(promises)

  const errorResults = await database.getErroredFiles()
  const errors = {}
  errorResults.forEach((error) => {
    const {
      downloadId: erroredDownloadId,
      numberErrors
    } = error
    errors[erroredDownloadId] = { numberErrors }
  })

  const filesTotals = await database.getFilesTotals()
  const {
    totalFiles,
    totalCompletedFiles
  } = filesTotals

  return {
    downloadsReport,
    errors,
    totalCompletedFiles,
    totalDownloads,
    totalFiles
  }
}

export default requestDownloadsProgress
