import downloadStates from '../constants/downloadStates'

/**
 * Parses the DownloadReport into values used by components
 * @param {Object} report Report generated by the main process for the download
 */
const parseDownloadReport = (report) => {
  const allDownloadsPaused = !!(report.length && report.every(
    ({ state }) => (
      state === downloadStates.paused
      || state === downloadStates.interrupted
    )
  ))

  const allDownloadsPausedOrCompleted = !!(report.length && report.every(
    ({ state }) => (
      state === downloadStates.paused
      || state === downloadStates.interrupted
      || state === downloadStates.completed
    )
  ))

  const allDownloadsCompleted = !!(report.length && report.every(
    ({ state }) => (
      state === downloadStates.completed
      || state === downloadStates.cancelled
      || state === downloadStates.error
    )
  ))

  const hasActiveDownload = !!(report.length && report.some(
    ({ state }) => state === downloadStates.active
  ))

  const hasPausedDownload = !!(report.length && report.some(
    ({ state }) => (
      state === downloadStates.paused
      || state === downloadStates.interrupted
    )
  ))

  let derivedStateFromDownloads = downloadStates.completed
  if (allDownloadsCompleted) {
    derivedStateFromDownloads = downloadStates.completed
  } else if (allDownloadsPaused) {
    derivedStateFromDownloads = downloadStates.paused
  } else if (allDownloadsPausedOrCompleted) {
    derivedStateFromDownloads = downloadStates.paused
  } else if (hasActiveDownload) {
    derivedStateFromDownloads = downloadStates.active
  } else if (hasPausedDownload) {
    derivedStateFromDownloads = downloadStates.paused
  } else {
    derivedStateFromDownloads = downloadStates.active
  }

  return {
    allDownloadsCompleted,
    allDownloadsPaused,
    derivedStateFromDownloads,
    hasActiveDownload
  }
}

export default parseDownloadReport
