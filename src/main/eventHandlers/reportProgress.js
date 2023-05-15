const downloadStates = require('../../app/constants/downloadStates')

const reportProgress = ({
  store,
  webContents
}) => {
  // Pull download status for each download in the store
  const downloads = store.get('downloads')
  // console.log('🚀 ~ file: reportProgress.js:9 ~ downloads:', downloads)

  if (!downloads) return false

  const progress = Object.keys(downloads)
    // Show the newest downloads first
    .sort((a, b) => {
      if (downloads[a].timeStart > downloads[b].timeStart) return -1

      return 1
    })
    .map((downloadId) => {
      const download = downloads[downloadId]

      const {
        files,
        name: downloadName = downloadId,
        state,
        timeEnd,
        timeStart
      } = download

      const totalFiles = Object.keys(files).length
      const finishedFiles = Object.entries(files)
        .filter(([, values]) => values.state === downloadStates.completed).length

      const percent = Math.floor((finishedFiles / totalFiles) * 100)
      // percent,
      // finishedFiles,
      // totalFiles,
      // totalTime
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
        progress,
        state
      }
    })

  // console.log('🚀 ~ file: reportProgress.js:47 ~ progress:', progress)
  webContents.send('reportProgress', { progress })

  return true
}

module.exports = reportProgress
