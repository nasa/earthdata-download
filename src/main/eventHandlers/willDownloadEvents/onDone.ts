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
    id: fileId,
    state: previousState
  } = file
  // Remove the item from the currentDownloadItems
  currentDownloadItems.removeItem(downloadId, filename)
  let errors

  const { state: downloadState } = await database.getDownloadById(downloadId)
  let updatedState = previousState
  switch (state) {
    case 'cancelled':
      // If the download is `appQuitting`, don't change the state of the file
      if (downloadState !== downloadStates.appQuitting) {
        updatedState = downloadStates.cancelled
      }

      break
    case 'interrupted':
      updatedState = downloadStates.error
      errors = 'This file could not be downloaded'
      break
    default:
      updatedState = downloadStates.completed
      break
  }

  // If the `previousState` is not active, don't worry about updating the file
  if (previousState === downloadStates.active) {
    // Update the state in the database
    await database.updateFileById(fileId, {
      errors,
      percent: updatedState === downloadStates.completed ? 100 : 0,
      state: updatedState,
      timeEnd: new Date().getTime()
    })
  }

  // Start the next download
  await startNextDownload({
    currentDownloadItems,
    database,
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
