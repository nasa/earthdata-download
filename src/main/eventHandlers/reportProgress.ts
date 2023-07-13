// @ts-nocheck

import downloadStates from '../../app/constants/downloadStates'

/**
 * Reports current progress on downloads
 * @param {Object} params
 * @param {Object} params.database `EddDatabase` instance
 * @param {Object} params.webContents Electron BrowserWindow instance's webContents
 */
const reportProgress = async ({
  database,
  webContents
}) => {
  // Pull download status for each download in the database
  const downloads = await database.getAllDownloads()

  if (downloads.length === 0) {
    webContents.send('reportProgress', {
      progressReport: []
    })

    return
  }

  const promises = downloads.map(async (download) => {
    const {
      createdAt,
      id: downloadId,
      loadingMoreFiles,
      name: downloadName = downloadId,
      state,
      timeEnd,
      timeStart
    } = download

    const {
      percentSum,
      erroredFiles,
      totalFiles,
      finishedFiles
    } = await database.getDownloadFilesProgressByDownloadId(downloadId)

    // If any erroredFiles exist, get the files
    let errors
    if (erroredFiles > 0) {
      errors = await database.getFilesWhere({
        downloadId,
        state: downloadStates.error
      })
    }

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
      downloadName,
      errors,
      // Sqlite booleans are actually integers 1/0
      loadingMoreFiles: loadingMoreFiles === 1,
      progress,
      state
    }
  })

  const progressReport = await Promise.all(promises)

  webContents.send('reportProgress', { progressReport })
}

export default reportProgress
