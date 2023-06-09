// @ts-nocheck

import downloadStates from '../../app/constants/downloadStates'

/**
 * Cancels a download and updates the store state
 * @param {Object} params
 * @param {Object} params.currentDownloadItems CurrentDownloadItems class instance that holds all of the active DownloadItems instances
 * @param {Object} params.info `info` parameter from ipc message
 * @param {Object} params.store `electron-store` instance
 */
const cancelDownloadItem = ({
  currentDownloadItems,
  info,
  store
}) => {
  const { downloadId, name } = info

  if (downloadId) {
    store.set(`downloads.${downloadId.replaceAll('.', '\\.')}.state`, downloadStates.completed)
  }

  currentDownloadItems.cancelItem(downloadId, name)

  // Cancelling a download will remove it from the list of downloads
  // TODO how will this work when cancelling a granule download? I don't think we want to remove single items from a provided list of links
  if (downloadId && !name) store.delete(`downloads.${downloadId.replaceAll('.', '\\.')}`)

  if (!downloadId) store.delete('downloads')
}

export default cancelDownloadItem
