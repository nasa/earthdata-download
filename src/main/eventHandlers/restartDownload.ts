// @ts-nocheck

import downloadStates from '../../app/constants/downloadStates'
import startNextDownload from '../utils/startNextDownload'

/**
 * Updates the files of a download to `pending`, sets the download to `active`, and calls `startNextDownload`
 * @param {Object} params
 * @param {Object} params.currentDownloadItems CurrentDownloadItems class instance that holds all of the active DownloadItems instances
 * @param {Object} params.database `EddDatabase` instance
 * @param {Object} params.downloadIdContext Object where we can associate a newly created download to a downloadId
 * @param {Object} params.info `info` parameter from ipc message
 * @param {Object} params.webContents Electron BrowserWindow instance's webContents
 */
const restartDownload = async ({
  currentDownloadItems,
  database,
  downloadIdContext,
  info,
  webContents
}) => {
  const {
    downloadId,
    filename
  } = info

  // Set the files to cancelling
  const updateWhere = { downloadId }
  if (filename) {
    updateWhere.filename = filename
  }

  await database.updateFilesWhere(updateWhere, {
    state: downloadStates.cancelling
  })

  currentDownloadItems.cancelItem(downloadId, filename)

  const resetFileValues = {
    state: downloadStates.pending,
    percent: 0,
    timeStart: null,
    timeEnd: null,
    errors: null,
    receivedBytes: null,
    totalBytes: null
  }

  if (downloadId && filename) {
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

    await database.deletePausesByDownloadIdAndFilename(downloadId, filename)

    await database.updateFilesWhere({
      downloadId,
      filename
    }, resetFileValues)

    // Set the download to active
    await database.updateDownloadById(downloadId, {
      state: downloadStates.active,
      timeEnd: null,
      errors: null
    })
  }

  if (downloadId && !filename) {
    await database.deleteAllPausesByDownloadId(downloadId)

    // Set the files to pending
    await database.updateFilesWhere({
      downloadId
    }, resetFileValues)

    // Set the download to active
    await database.updateDownloadById(downloadId, {
      state: downloadStates.active,
      active: true,
      timeStart: new Date().getTime(),
      timeEnd: null,
      errors: null
    })
  }

  await startNextDownload({
    currentDownloadItems,
    database,
    downloadIdContext,
    webContents
  })
}

export default restartDownload
