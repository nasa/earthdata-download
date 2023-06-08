// @ts-nocheck

import downloadStates from '../../../app/constants/downloadStates'

/**
 * Handles the DownloadItem 'updated' event
 * @param {Object} params
 * @param {String} params.downloadId downloadId of the DownloadItem being downloaded
 * @param {Object} params.item Electron DownloadItem class instance
 * @param {String} params.state Updated state of the DownloadItem
 * @param {Object} params.store `electron-store` instance
 */
const onUpdated = ({
  downloadId,
  item,
  state,
  store
}) => {
  const name = item.getFilename()
  // Escape the `.` character in the file name for interacting with the store
  const storeName = name.replaceAll('.', '\\.')

  // Get the download item from the store
  const storeItem = store.get(`downloads.${downloadId}.files.${storeName}`)

  if (!storeItem) {
    item.cancel()
    return
  }

  // Calculate the percent done of the download
  const receivedBytes = item.getReceivedBytes()
  const totalBytes = item.getTotalBytes()
  const percentDone = Math.floor((receivedBytes / totalBytes) * 100)

  if (state === 'interrupted') {
    // Update the store if the state has updated to interrupted
    store.set(`downloads.${downloadId}.files.${storeName}`, {
      ...storeItem,
      state: downloadStates.interrupted,
      percent: percentDone
    })

    // Set the downloadId state to interrupted
    const storeDownload = store.get(`downloads.${downloadId}`)
    store.set(`downloads.${downloadId}`, {
      ...storeDownload,
      state: downloadStates.interrupted
    })
  } else if (state === 'progressing') {
    // Update the store with the percent and state
    store.set(`downloads.${downloadId}.files.${storeName}`, {
      ...storeItem,
      state: item.isPaused() ? downloadStates.paused : downloadStates.active,
      percent: percentDone
    })
  }
}

export default onUpdated
