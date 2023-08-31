// @ts-nocheck

import { dialog } from 'electron'

/**
 * Warn the user that quitting with active downloads will lose download progress
 * @param {Object} params
 * @param {Object} params.currentDownloadItems CurrentDownloadItems class instance that holds all of the active DownloadItems instances
 */
const beforeQuit = async ({
  currentDownloadItems
}) => {
  const numberRunningDownloads = currentDownloadItems.getNumberOfDownloads()

  if (numberRunningDownloads === 0) return false

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
    return false
  }

  // `Cancel` was selected
  return true
}

export default beforeQuit
