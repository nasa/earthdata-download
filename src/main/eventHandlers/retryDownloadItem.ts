// @ts-nocheck

import downloadStates from '../../app/constants/downloadStates'

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

  const retryItemDownload = (async (downloadId, name) => {
    const { state } = await database.getFileWhere({
      filename: name,
      downloadId
    })
    // Save the item before cancelling to re-queue
    const item = currentDownloadItems.getItem(downloadId, name)
    currentDownloadItems.cancelItem(downloadId, name)

    if (state === downloadStates.error) {
      const { numErrors: oldErrors } = await database.getDownloadById(downloadId)
      await database.updateDownloadById(downloadId, { numErrors: oldErrors - 1 })
      await database.updateFile(name, {
        state: downloadStates.active,
        errors: undefined,
        timeEnd: undefined
      })
    }

    const url = item.getURL()
    // eslint-disable-next-line no-param-reassign
    downloadIdContext[url] = downloadId
    webContents.downloadURL(url)
  })

  const retryCollectionDownload = (async (downloadId) => {
    const items = currentDownloadItems.getAllItemsInDownload(downloadId)
    Object.keys(items).forEach((name) => {
      retryItemDownload(downloadId, name)
    })
    await database.updateDownloadById(downloadId, { state: downloadStates.active })
  })

  if (!downloadId) {
    // Restart all collection downloads
    Object.keys(downloads).forEach((downloadId) => {
      retryCollectionDownload(downloadId)
    })
  } else if (!name) {
    // Restart a collection download
    retryCollectionDownload(downloadId)
  } else {
    // Restart an item download
    retryItemDownload(downloadId, name)
  }
}

export default retryDownloadItem
