// @ts-nocheck

import downloadStates from '../../../app/constants/downloadStates'
import finishDownload from './finishDownload'
import startNextDownload from '../../utils/startNextDownload'

/**
 * Handles the DownloadItem 'done' event
 * @param {Object} params
 * @param {Object} params.currentDownloadItems CurrentDownloadItems class instance that holds all of the active DownloadItems instances
 * @param {Object} params.database `EddDatabase` instance
 * @param {String} params.downloadId downloadId of the DownloadItem being downloaded
 * @param {Object} params.downloadIdContext Object where we can associate a newly created download to a downloadId
 * @param {Object} params.item Electron DownloadItem class instance
 * @param {String} params.state Updated state of the DownloadItem
 * @param {Object} params.webContents Electron BrowserWindow instance's webContents
 */
const onDone = async ({
  currentDownloadItems,
  database,
  downloadId,
  downloadIdContext,
  item,
  state,
  webContents
}) => {
  const filename = item.getFilename()
  console.log('🚀 ~ file: onDone.ts:28 ~ filename:', filename)

  // Get the download item from the database
  const file = await database.getFileWhere({
    filename,
    downloadId
  })

  // If the file is not found in the database, cancel the download
  if (!file) {
    return
  }

  const {
    id: fileId
  } = file

  // Remove the item from the currentDownloadItems
  currentDownloadItems.removeItem(downloadId, filename)

  let updatedState
  switch (state) {
    case 'cancelled':
      // TODO should this go into cancelled
      updatedState = downloadStates.pending
      break
    case 'interrupted':
      // TODO how to get a file into this state?
      // Try deleting in progress file from downloads folder
      // Try serving file from local server, deleting file as it is downloading from server
      // Try taking server offline during download
      updatedState = downloadStates.error
      break
    default:
      updatedState = downloadStates.completed
      break
  }

  // Update the state in the database
  await database.updateFile(fileId, {
    timeEnd: new Date().getTime(),
    state: updatedState,
    percent: updatedState === downloadStates.completed ? 100 : 0
  })

  // Start the next download
  await startNextDownload({
    currentDownloadItems,
    database,
    downloadId,
    downloadIdContext,
    webContents
  })

  // Finish the download
  await finishDownload({
    database,
    downloadId
  })
}

export default onDone
