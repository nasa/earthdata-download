// @ts-nocheck

import reportFilesProgress from '../eventHandlers/reportFilesProgress'

/**
 * Start reporting file progress updates by starting up the interval with `reportFilesProgress`
 * @param {Object} params
 * @param {Object} params.database `EddDatabase` instance
 * @param {Object} params.webContents Electron BrowserWindow instance's webContents
 * @param {Number} params.reportInterval The current report interval if there is one already running
 * @param {Number} params.intervalTime The time for how often we poll the database for updates
 * @param {Object} params.info The `info` parameter from ipc message
*/
const startReportingFiles = async ({
  database,
  webContents,
  reportInterval,
  intervalTime
}, { info }) => {
  const { downloadName = '' } = info

  // Clear the interval if it has been already set for seamless transition
  if (reportInterval) {
    clearInterval(reportInterval)
  }

  // Run initially before polling interval starts since setInterval waits `intervalTime` before starting
  await reportFilesProgress({
    database,
    webContents,
    downloadId: downloadName
  })

  const newReportInterval = setInterval(async () => {
    await reportFilesProgress({
      database,
      webContents,
      downloadId: downloadName
    })
  }, intervalTime)

  return newReportInterval
}

export default startReportingFiles
