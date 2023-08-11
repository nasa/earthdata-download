import downloadStates from '../constants/downloadStates'

const parseDownloadReport = (report) => {
  // TODO Consider improving how we are determining these states. For downloads with
  // many files, this method may not be ideal.
  const allDownloadsPaused = !!(report.length && report.every(
    ({ state }) => (state === downloadStates.paused)
  ))

  const allDownloadsCompleted = !!(report.length && report.every(
    ({ state }) => state === downloadStates.completed
  ))

  const hasActiveDownload = !!(report.length && report.some(
    ({ state }) => state === downloadStates.active
  ))

  const hasPausedDownload = !!(report.length && report.some(
    ({ state }) => state === downloadStates.paused
  ))

  const totalDownloadFiles = report.length && report.reduce(
    (acc, cur) => cur.progress.totalFiles + acc,
    0
  )

  const totalCompletedFiles = report.length && report.reduce(
    (acc, cur) => cur.progress.finishedFiles + acc,
    0
  )

  let derivedStateFromDownloads = downloadStates.completed
  if (allDownloadsCompleted) {
    derivedStateFromDownloads = downloadStates.completed
  } else if (allDownloadsPaused) {
    derivedStateFromDownloads = downloadStates.paused
  } else if (hasActiveDownload) {
    derivedStateFromDownloads = downloadStates.active
  } else if (hasPausedDownload) derivedStateFromDownloads = downloadStates.paused

  return {
    allDownloadsCompleted,
    allDownloadsPaused,
    derivedStateFromDownloads,
    hasActiveDownload,
    totalCompletedFiles,
    totalDownloadFiles
  }
}

export default parseDownloadReport
