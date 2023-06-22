// @ts-nocheck

import 'array-foreach-async'

import downloadStates from '../../app/constants/downloadStates'

/**
 * Resumes a download and updates the database
 * @param {Object} params
 * @param {Object} params.currentDownloadItems CurrentDownloadItems class instance that holds all of the active DownloadItems instances
 * @param {Object} params.database `EddDatabase` instance
 * @param {Object} params.info `info` parameter from ipc message
 */
const resumeDownloadItem = async ({
  currentDownloadItems,
  database,
  info
}) => {
  const { downloadId, name } = info

  currentDownloadItems.resumeItem(downloadId, name)

  if (downloadId && !name) {
    const numberFiles = await database.getFileCountWhere({ downloadId })

    // If files exist, put the item into active
    let newState = downloadStates.active

    // If no files exist, put the item back into pending
    if (numberFiles === 0) newState = downloadStates.pending

    await database.updateDownloadById(downloadId, {
      state: newState
    })
  }

  if (!downloadId) {
    const downloads = await database.getAllDownloads()

    await downloads.forEachAsync(async (download) => {
      const { id, state } = download

      const numberFiles = await database.getFileCountWhere({ downloadId: id })

      // Default to the current state value
      let newState = state

      // If the state is paused and there are files, set to active
      if (state === downloadStates.paused && numberFiles > 0) newState = downloadStates.active
      // If the state is paused and there are no files, set to pending
      if (state === downloadStates.paused && numberFiles === 0) newState = downloadStates.pending

      await database.updateDownloadById(id, {
        state: newState
      })
    })
  }
}

export default resumeDownloadItem
