// @ts-nocheck

import downloadStates from '../../app/constants/downloadStates'

/**
 * Pauses a download and updates the store state
 * @param {Object} params
 * @param {Object} params.currentDownloadItems CurrentDownloadItems class instance that holds all of the active DownloadItems instances
 * @param {Object} params.info `info` parameter from ipc message
 * @param {Object} params.store `electron-store` instance
 */
const pauseDownloadItem = ({
  currentDownloadItems,
  info,
  store
}) => {
  const { downloadId, name } = info

  currentDownloadItems.pauseItem(downloadId, name)

  if (downloadId && !name) store.set(`downloads.${downloadId.replaceAll('.', '\\.')}.state`, downloadStates.paused)

  if (!downloadId) {
    const downloads = store.get('downloads')

    Object.keys(downloads).forEach((downloadId) => {
      const download = downloads[downloadId]
      const { state } = download

      const newState = state === downloadStates.active || state === downloadStates.pending
        ? downloadStates.paused
        : state
      download.state = newState
    })

    store.set('downloads', downloads)
  }
}

export default pauseDownloadItem
