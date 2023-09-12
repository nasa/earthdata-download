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
    active,
    limit = 10,
    offset = 0
  } = info

  const totalDownloads = await database.getAllDownloadsCount(active)

  if (totalDownloads === 0) {
    return {
      downloadsReport: [],
      totalDownloads
    }
  }

  // Pull download status for each download in the database
  const downloads = await database.getDownloadsReport(active, limit, offset)

  const promises = downloads.map(async (download) => {
    const {
      id: downloadId,
      loadingMoreFiles,
      state,
      timeStart,
      totalTime
    } = download

    const {
      percentSum,
      totalFiles,
      finishedFiles
    } = await database.getDownloadReport(downloadId)

    const pausesSum = await database.getPausesSum(downloadId)

    let percent = 0

    if (totalFiles > 0) {
      // Round to 1 decimal place
      percent = Math.round((percentSum / totalFiles) * 10) / 10
    }

    const progress = {
      percent,
      finishedFiles,
      totalFiles,
      totalTime: totalTime - pausesSum
    }

    return {
      downloadId,
      // Sqlite booleans are actually integers 1/0
      loadingMoreFiles: loadingMoreFiles === 1,
      progress,
      state,
      timeStart
    }
  })

  const downloadsReport = await Promise.all(promises)

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
