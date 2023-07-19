// @ts-nocheck

import downloadStates from '../../app/constants/downloadStates'
import startNextDownload from '../utils/startNextDownload'

/**
 * Updates the files of a download to `pending`, sents the download to `active`, and calls `startNextDownload`
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
  const { downloadId } = info

  // Set the files to pending
  await database.updateFilesWhere({
    downloadId
  }, {
    state: downloadStates.pending,
    percent: 0
  })

  // Set the download to active
  await database.updateDownloadById(downloadId, {
    state: downloadStates.active,
    timeStart: new Date().getTime()
  })

  await startNextDownload({
    currentDownloadItems,
    database,
    downloadIdContext,
    webContents
  })
}

export default restartDownload
