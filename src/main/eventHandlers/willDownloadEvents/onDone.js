const downloadStates = require('../../../app/constants/downloadStates')
const startNextDownload = require('./startNextDownload')

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
  const storeName = name.replace('.', '\\.')

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
  store.set(`downloads.${downloadId}.files.${storeName}`, {
    ...storeItem,
    timeEnd: new Date().getTime(),
    state: updatedState,
    percent: updatedState === downloadStates.completed ? 100 : 0,
    errors
  })

  // TODO trying to loop through here isn't working because its inside an event handler, so all 5 are being cancelled at once, so startNextDownload is being called 5 times at the same time, not within a timeout

  // const numberOfRunningDownloads = currentDownloadItems.getNumberOfDownloads()
  // const concurrentDownloads = store.get('preferences.concurrentDownloads')

  // const numberDownloadsToStart = concurrentDownloads - numberOfRunningDownloads
  // Array.from(Array(numberDownloadsToStart)).forEach(() => {
  //   setTimeout(() => {
  //     // Start the next file downloading
  //     startNextDownload({
  //       downloadId,
  //       downloadIdContext,
  //       store,
  //       wasCancelled: state === 'cancelled',
  //       webContents
  //     })
  //   }, 500)
  // })
  // Start the next file downloading
  startNextDownload({
    downloadId,
    downloadIdContext,
    store,
    wasCancelled: state === 'cancelled',
    webContents
  })
}

module.exports = onDone
