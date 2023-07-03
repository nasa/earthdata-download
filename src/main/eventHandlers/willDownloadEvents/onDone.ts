// @ts-nocheck

import downloadStates from '../../../app/constants/downloadStates'
import startNextDownload from './startNextDownload'

/**
 * Handles the DownloadItem 'done' event
 * @param {Object} params
 * @param {Object} params.currentDownloadItems CurrentDownloadItems class instance that holds all of the active DownloadItems instances
 * @param {Object} params.database `EddDatabase` instance
 * @param {Object} params.downloadIdContext Object where we can associated a newly created download to a downloadId
 * @param {Object} params.item Electron DownloadItem class instance
 * @param {Object} params.webContents Electron BrowserWindow instance's webContents
 * @param {String} params.downloadId downloadId of the DownloadItem being downloaded
 * @param {String} params.state Updated state of the DownloadItem
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

  const download = await database.getDownloadById(downloadId)

  // If the file is not found in the database, cancel the download
  if (!file) {
    return
  }

  const {
    id: fileId
  } = file
  console.log(state)

  let updatedState
  switch (state) {
    case 'cancelled':
      updatedState = downloadStates.pending
      break
    case 'interrupted':
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

  if (updatedState !== downloadStates.error) {
    // Remove the item from the currentDownloadItems
    currentDownloadItems.removeItem(downloadId, filename)
  } else {
    const { numErrors } = download
    await database.updateDownloadById(downloadId, {
      numErrors: numErrors + 1
    })
  }

  // Start the next download
  await startNextDownload({
    currentDownloadItems,
    database,
    downloadId,
    downloadIdContext,
    webContents
  })
}

export default onDone
