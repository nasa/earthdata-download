// @ts-nocheck

import downloadStates from '../../app/constants/downloadStates'
import startNextDownload from '../utils/startNextDownload'

/**
 * Updates the downloadIds within `info` to active and restarts downloads
 * @param {Object} params
 * @param {Object} params.currentDownloadItems CurrentDownloadItems class instance that holds all of the active DownloadItems instances
 * @param {Object} params.database `EddDatabase` instance
 * @param {Object} params.downloadIdContext Object where we can associate a newly created download to a downloadId
 * @param {Object} params.info `info` parameter from ipc message
 * @param {Object} params.webContents Electron BrowserWindow instance's webContents
 */
const retryDownloadItem = async ({
  currentDownloadItems,
  database,
  downloadIdContext,
  info,
  webContents
}) => {
  console.log('🚀 ~ file: retryDownloadItem.ts:73 ~ info:', info)
  const { downloadId, filename } = info

  if (downloadId && filename) {
    // Set the file to pending, and call startNextDownload
    await database.updateFilesWhere({
      downloadId,
      filename
    }, {
      state: downloadStates.pending
    })
  }

  if (downloadId && !filename) {
    // Retry all errored files for downloadId
    await database.updateFilesWhere({
      downloadId,
      state: downloadStates.error
    }, {
      state: downloadStates.pending
    })
  }

  await startNextDownload({
    currentDownloadItems,
    database,
    downloadIdContext,
    webContents
  })
}

export default retryDownloadItem
