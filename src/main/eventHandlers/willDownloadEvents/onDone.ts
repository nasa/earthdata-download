// @ts-nocheck

import downloadStates from '../../../app/constants/downloadStates'
import startNextDownload from './startNextDownload'

/**
 * Handles the DownloadItem 'done' event
 * @param {Object} params
 * @param {Object} params.currentDownloadItems CurrentDownloadItems class instance that holds all of the active DownloadItems instances
 * @param {String} params.downloadId downloadId of the DownloadItem being downloaded
 * @param {Object} params.downloadIdContext Object where we can associated a newly created download to a downloadId
 * @param {Object} params.item Electron DownloadItem class instance
 * @param {String} params.state Updated state of the DownloadItem
 * @param {Object} params.store `electron-store` instance
 * @param {Object} params.webContents Electron BrowserWindow instance's webContents
 */
const onDone = ({
  currentDownloadItems,
  downloadId,
  downloadIdContext,
  item,
  state,
  store,
  webContents
}) => {
  const name = item.getFilename()
  // Escape the `.` character in the file name for interacting with the store
  const storeName = name.replaceAll('.', '\\.')

  // Get the download item from the store
  const storeItem = store.get(`downloads.${downloadId}.files.${storeName}`)

  // Remove the item from the currentDownloadItems
  currentDownloadItems.removeItem(downloadId, name)

  // TODO EDD-16, figure out if there are any errors available here
  const errors = undefined

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

  // Update the state in the store
  if (storeItem) {
    store.set(`downloads.${downloadId}.files.${storeName}`, {
      ...storeItem,
      timeEnd: new Date().getTime(),
      state: updatedState,
      percent: updatedState === downloadStates.completed ? 100 : 0,
      errors
    })
  }

  startNextDownload({
    currentDownloadItems,
    downloadId,
    downloadIdContext,
    store,
    webContents
  })
}

export default onDone
