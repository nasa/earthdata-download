// @ts-nocheck

import downloadStates from '../../app/constants/downloadStates'

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
      cancelId,
      id: downloadId,
      loadingMoreFiles,
      restartId,
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

    // Restarting/cancelling files aren't actually restarted/cancelled until the setTimeout expires, so while a
    // restartId/cancelId exists we need to fake a 'pending'/'cancelled' file.
    if (restartId || cancelId) {
      return {
        downloadId,
        loadingMoreFiles: false,
        progress: {
          percent: 0,
          finishedFiles: 0,
          totalFiles,
          totalTime: 0
        },
        state: restartId ? downloadStates.pending : downloadStates.cancelled,
        timeStart: null
      }
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

  // If active is false, we don't need files totals
  let filesTotals = {}
  if (active) {
    filesTotals = await database.getFilesTotals()
  }

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
