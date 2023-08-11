// @ts-nocheck

import reportFilesProgress from '../eventHandlers/reportFilesProgress'

/**
 * Start reporting file progress updates by starting up the interval with `reportFilesProgress`
 * @param {Object} params
 * @param {Object} params.database `EddDatabase` instance
 * @param {Object} params.info The `info` parameter from ipc message
 * @param {Number} params.intervalTime The time for how often we poll the database for updates
 * @param {Number} params.reportInterval The current report interval if there is one already running
 * @param {Object} params.webContents Electron BrowserWindow instance's webContents
*/
const startReportingFiles = async ({
  database,
  info,
  intervalTime,
  reportInterval,
  webContents
}) => {
  const { downloadId = '' } = info

  // Clear the interval if it has been already set for seamless transition
  if (reportInterval) {
    clearInterval(reportInterval)
  }

  // Run initially before polling interval starts since setInterval waits `intervalTime` before starting
  await reportFilesProgress({
    database,
    webContents,
    downloadId
  })

  const newReportInterval = setInterval(async () => {
    await reportFilesProgress({
      database,
      webContents,
      downloadId
    })
  }, intervalTime)

  return newReportInterval
}

export default startReportingFiles
