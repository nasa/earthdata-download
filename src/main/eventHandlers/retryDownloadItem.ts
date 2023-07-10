// @ts-nocheck

import downloadStates from '../../app/constants/downloadStates'
import willDownload from './willDownload'

/**
 * Updates the downloadIds within `info` to active and restarts downloads
 * @param {Object} params
 * @param {Object} params.currentDownloadItems CurrentDownloadItems class instance that holds all of the active DownloadItems instances
 * @param {Object} params.database `EddDatabase` instance
 * @param {Object} params.downloadIdContext Object where we can associate a newly created download to a downloadId
 * @param {Object} params.info `info` parameter from ipc message
 * @param {Object} params.webContents Electron BrowserWindow instance's webContents
 */
const retryDownloadItem = async ({
  currentDownloadItems,
  database,
  downloadIdContext,
  info,
  webContents
}) => {
  const { downloadId, name } = info
  const downloads = await database.getAllDownloads()

  const retryItem = (async (downloadId, name) => {
    const { state } = await database.getFileWhere({
      filename: name,
      downloadId
    })
    // Save the item before cancelling to re-queue
    const item = currentDownloadItems.getItem(downloadId, name)
    currentDownloadItems.cancelItem(downloadId, name)

    if (state === downloadStates.error) {
      // const { numErrors: oldErrors } = await database.getDownloadById(downloadId)
      // await database.updateDownloadById(downloadId, { numErrors: oldErrors - 1 })
      await database.updateFile(name, {
        state: downloadStates.active,
        errors: undefined,
        timeEnd: undefined
      })
    }

    willDownload({
      currentDownloadItems,
      database,
      downloadIdContext,
      item,
      webContents
    })
  })

  const retryCollection = (async (downloadId) => {
    const items = currentDownloadItems.getAllItemsInDownload(downloadId)
    Object.keys(items).forEach(async (name) => {
      retryItem(downloadId, name)
    })
    await database.updateDownloadById(downloadId, { state: downloadStates.active, numErrors: 0 })
  })

  if (!downloadId) {
    // Restart all collection downloads
    Object.keys(downloads).forEach((downloadIndex) => {
      const { id } = downloads[downloadIndex]
      retryCollection(id)
    })
  } else if (!name) {
    // Restart a collection download
    retryCollection(downloadId)
  } else {
    // Restart an item download
    retryItem(downloadId, name)
  }
}

export default retryDownloadItem
