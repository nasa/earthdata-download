// @ts-nocheck

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
    webContents.send('reportProgress', { progress: [], errorInfo: [] })
    return
  }

  const promises = downloads.map(async (download) => {
    const {
      id: downloadId,
      loadingMoreFiles,
      name: downloadName = downloadId,
      numErrors,
      state,
      timeEnd,
      timeStart
    } = download

    const {
      percentSum,
      totalFiles,
      finishedFiles
    } = await database.getDownloadFilesProgressByDownloadId(downloadId)
    const files = await database.getFilesWhere({ downloadId })

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

    const errorInfo = []
    if (state === downloadStates.error) {
      Object.keys(files).forEach((itemName) => {
        const { state: itemState, url } = files[itemName]
        if (itemState === downloadStates.error) {
          errorInfo.push({
            itemName,
            url
          })
        }
      })
    }

    // Set state depending on if there are errored or active downloads remaining
    if (numErrors > 0 && !pausedFiles) {
      await database.updateDownloadById(downloadId, { state: downloadStates.error })
    } else if (activeFiles) {
      await database.updateDownloadById(downloadId, { state: downloadStates.active })
    }

    return {
      downloadId,
      downloadName,
      errorInfo,
      // Sqlite booleans are actually integers 1/0
      loadingMoreFiles: loadingMoreFiles === 1,
      numErrors,
      progress,
      state
    }
  })

  const progress = await Promise.all(promises)

  webContents.send('reportProgress', { progress })
}

export default reportProgress
