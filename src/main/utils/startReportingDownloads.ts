// @ts-nocheck

import reportDownloadsProgress from '../eventHandlers/reportDownloadsProgress'

/**
 * Start reporting download progress updates by starting up the interval with `reportDownloadsProgress`
 * @param {Object} params
 * @param {Object} params.database `EddDatabase` instance
 * @param {Object} params.webContents Electron BrowserWindow instance's webContents
 * @param {Number} params.reportInterval The current report interval if there is one already running
 * @param {Number} params.intervalTime The time for how often we poll the database for updates
 */
const startReportingDownloads = async ({
  database,
  webContents,
  reportInterval,
  intervalTime
}) => {
  // Clear the interval if it has been already set for seamless transition
  if (reportInterval) {
    clearInterval(reportInterval)
  }

  // Run initially before polling interval starts since setInterval waits `intervalTime` before starting
  await reportDownloadsProgress({
    database,
    webContents
  })

  const newReportInterval = setInterval(async () => {
    await reportDownloadsProgress({
      database,
      webContents
    })
  }, intervalTime)

  return newReportInterval
}

export default startReportingDownloads
