// @ts-nocheck

import downloadStates from '../../app/constants/downloadStates'

/**
 * Resumes a download and updates the store state
 * @param {Object} params
 * @param {Object} params.currentDownloadItems CurrentDownloadItems class instance that holds all of the active DownloadItems instances
 * @param {Object} params.info `info` parameter from ipc message
 * @param {Object} params.store `electron-store` instance
 */
const resumeDownloadItem = ({
  currentDownloadItems,
  info,
  store
}) => {
  const { downloadId, name } = info

  currentDownloadItems.resumeItem(downloadId, name)

  if (downloadId && !name) {
    const download = store.get(`downloads.${downloadId.replaceAll('.', '\\.')}`)
    const { files = {} } = download
    const numberFiles = Object.keys(files).length

    // If files exist, put the item into active
    let newState = downloadStates.active

    // If no files exist, put the item back into pending
    if (numberFiles === 0) newState = downloadStates.pending

    store.set(`downloads.${downloadId.replaceAll('.', '\\.')}.state`, newState)
  }

  if (!downloadId) {
    const downloads = store.get('downloads')

    Object.keys(downloads).forEach((downloadId) => {
      const download = downloads[downloadId]

      const { files = {}, state } = download
      const numberFiles = Object.keys(files).length

      // Default to the current state value
      let newState = state

      // If the state is paused and there are files, set to active
      if (state === downloadStates.paused && numberFiles > 0) newState = downloadStates.active
      // If the state is paused and there are no files, set to pending
      if (state === downloadStates.paused && numberFiles === 0) newState = downloadStates.pending

      download.state = newState
    })

    store.set('downloads', downloads)
  }
}

export default resumeDownloadItem
