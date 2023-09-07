// @ts-nocheck

import { dialog } from 'electron'

import downloadStates from '../../app/constants/downloadStates'

/**
 * Warn the user that quitting with active downloads will lose download progress
 * @param {Object} params
 * @param {Object} params.currentDownloadItems CurrentDownloadItems class instance that holds all of the active DownloadItems instances
 * @param {Object} params.database `EddDatabase` instance
 * @param {Object} params.event Electron event object
 */
const beforeQuit = async ({
  currentDownloadItems,
  database,
  event
}) => {
  const numberRunningDownloads = currentDownloadItems.getNumberOfDownloads()

  if (numberRunningDownloads === 0) return

  // Warn the user
  const result = dialog.showMessageBoxSync(null, {
    title: 'Active Downloads',
    detail: 'You have active downloads. If you quit the application you will lose progress. Do you want to quit?',
    message: 'Active Downloads',
    buttons: ['Quit', 'Cancel'],
    cancelId: 1
  })

  // `Quit` was selected
  if (result === 0) {
    // Set any active downloads to appQuitting, so they can resumed when the app re-opens
    const updatedDownloads = await database.updateDownloadsWhereIn([
      'state',
      [downloadStates.active]
    ], {
      state: downloadStates.appQuitting
    })

    // Create a new pause for those downloads that were updated
    const now = new Date().getTime()
    await Promise.all(updatedDownloads.map(async (updatedDownload) => {
      const {
        id: downloadId
      } = updatedDownload

      await database.createPauseWith({
        downloadId,
        timeStart: now
      })
    }))

    return
  }

  // `Cancel` was selected
  event.preventDefault()
}

export default beforeQuit
