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
    // TODO is errorInfo needed?
    webContents.send('reportProgress', { progress: [], errorInfo: [] })
    return
  }

  const promises = downloads.map(async (download) => {
    const {
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

    let errorInfo
    if (erroredFiles > 0) {
      errorInfo = await database.getFilesWhere({
        downloadId,
        state: downloadStates.error
      })
    }

    // const stateCounts = await database.getFileStateCounts(downloadId)
    // console.log('🚀 ~ file: reportProgress.ts:41 ~ promises ~ stateCounts:', stateCounts)

    let percent = 0

    if (totalFiles > 0) {
      // Round to 1 decimal place
      percent = Math.round((percentSum / totalFiles) * 10) / 10
    }

    const now = new Date().getTime()

    const lastTime = timeEnd || now

    const totalTime = Math.ceil((lastTime - timeStart) / 1000)

    const progress = {
      percent,
      finishedFiles,
      totalFiles,
      totalTime
    }

    // const files = await database.getFilesWhere({ downloadId })
    // const errorInfo = []
    // if (state === downloadStates.error) {
    //   (files).forEach((file) => {
    //     const {
    //       state: itemState,
    //       url,
    //       filename
    //     } = file

    //     if (itemState === downloadStates.error) {
    //       errorInfo.push({
    //         filename,
    //         url
    //       })
    //     }
    //   })
    // }

    // // TODO reportProgress should not update the database
    // // Set state depending on if there are errored or active downloads remaining
    // if (stateCounts.error > 0 && !stateCounts.paused) {
    //   await database.updateDownloadById(downloadId, { state: downloadStates.error })
    // } else if (stateCounts.active) {
    //   await database.updateDownloadById(downloadId, { state: downloadStates.active })
    // } else if (stateCounts.completed && stateCounts.completed === totalFiles) {
    //   await database.updateDownloadById(downloadId, { state: downloadStates.completed })
    // } else if (stateCounts.paused) {
    //   await database.updateDownloadById(downloadId, { state: downloadStates.paused })
    // }

    return {
      downloadId,
      downloadName,
      errorInfo,
      // Sqlite booleans are actually integers 1/0
      loadingMoreFiles: loadingMoreFiles === 1,
      numErrors: erroredFiles,
      progress,
      state
    }
  })

  const progress = await Promise.all(promises)

  webContents.send('reportProgress', { progress })
}

export default reportProgress
