// @ts-nocheck

import downloadStates from '../../app/constants/downloadStates'
import startNextDownload from '../utils/startNextDownload'

/**
 * Updates the necessary files to to pending and and calls `startNextDownload`
 * @param {Object} params
 * @param {Object} params.currentDownloadItems CurrentDownloadItems class instance that holds all of the active DownloadItems instances
 * @param {Object} params.database `EddDatabase` instance
 * @param {Object} params.downloadIdContext Object where we can associate a newly created download to a downloadId
 * @param {Object} params.info `info` parameter from ipc message
 * @param {Object} params.webContents Electron BrowserWindow instance's webContents
 */
const retryErroredDownloadItem = async ({
  currentDownloadItems,
  database,
  downloadIdContext,
  info,
  webContents
}) => {
  const { downloadId } = info

  // Retry all the errored files in a download.
  const download = await database.getDownloadById(downloadId)
  const { timeEnd } = download

  if (timeEnd !== null) {
    // If the download was previously finished, create a new pause from the previous `timeEnd` to now
    await database.createPauseWith({
      downloadId,
      timeStart: timeEnd,
      timeEnd: new Date().getTime()
    })
  }

  await database.deleteFilePausesByDownloadId(downloadId)

  // Retry all errored files for downloadId
  await database.updateFilesWhere({
    downloadId,
    state: downloadStates.error
  }, {
    state: downloadStates.pending,
    percent: 0,
    timeStart: null,
    timeEnd: null,
    errors: null,
    receivedBytes: null,
    totalBytes: null
  })

  // Set the download to active
  await database.updateDownloadById(downloadId, {
    state: downloadStates.active,
    timeEnd: null,
    errors: null
  })

  await startNextDownload({
    currentDownloadItems,
    database,
    downloadIdContext,
    webContents
  })
}

export default retryErroredDownloadItem
