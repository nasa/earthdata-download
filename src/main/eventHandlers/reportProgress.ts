// @ts-nocheck

import downloadStates from '../../app/constants/downloadStates'

/**
 *
 * @param params
 * @returns
 */
const reportProgress = async ({
  database,
  webContents
}) => {
  // Pull download status for each download in the database
  const downloads = await database.getAllDownloads()

  if (downloads.length === 0) {
    webContents.send('reportProgress', { progress: [] })
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
    const files = await database.getFilesWhere({ downloadId })

    const totalFiles = Object.keys(files).length
    const finishedFiles = Object.entries(files)
      .filter(([, values]) => values.state === downloadStates.completed).length

    let percent = 0

    if (totalFiles > 0) {
      percent = Math.floor((finishedFiles / totalFiles) * 100)
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

    return {
      downloadId,
      downloadName,
      // Sqlite booleans are actually integers 1/0
      loadingMoreFiles: loadingMoreFiles === 1,
      progress,
      state
    }
  })

  const progress = await Promise.all(promises)

  webContents.send('reportProgress', { progress })
}

export default reportProgress
