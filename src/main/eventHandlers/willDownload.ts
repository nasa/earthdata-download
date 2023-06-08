// @ts-nocheck

import path from 'path'

import onDone from './willDownloadEvents/onDone'
import onUpdated from './willDownloadEvents/onUpdated'

/**
 * Handles the DownloadItem events
 * @param {Object} params
 */
const willDownload = ({
  currentDownloadItems,
  downloadId,
  downloadIdContext,
  item,
  store,
  webContents
}) => {
  if (!downloadId) {
    item.cancel()
    return
  }

  // Pull the downloadLocation for this downloadId from the store
  const downloadLocation = store.get(`downloads.${downloadId}.downloadLocation`)

  if (!downloadLocation) {
    item.cancel()
    return
  }

  // Set the save path for the DownloadItem
  const name = item.getFilename()
  item.setSavePath(path.join(downloadLocation, name))

  // Add the DownloadItem to the currentDownloadItems
  currentDownloadItems.addItem(downloadId, name, item)

  // Escape the `.` character in the file name for interacting with the store
  const storeName = name.replaceAll('.', '\\.')
  store.set(`downloads.${downloadId}.files.${storeName}.timeStart`, new Date().getTime())

  item.on('updated', (event, state) => {
    onUpdated({
      downloadId,
      item,
      state,
      store
    })
  })

  item.once('done', (event, state) => {
    onDone({
      currentDownloadItems,
      downloadId,
      downloadIdContext,
      item,
      state,
      store,
      webContents
    })
  })
}

export default willDownload
