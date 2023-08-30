// @ts-nocheck

import path from 'path'

import startNextDownload from '../utils/startNextDownload'

import downloadStates from '../../app/constants/downloadStates'

/**
 * Updates the downloadIds within `info` to active and starts downloads
 * @param {Object} params
 * @param {Object} params.currentDownloadItems CurrentDownloadItems class instance that holds all of the active DownloadItems instances
 * @param {Object} params.database `EddDatabase` instance
 * @param {Object} params.downloadIdContext Object where we can associate a newly created download to a downloadId
 * @param {Object} params.info `info` parameter from ipc message
 * @param {Object} params.webContents Electron BrowserWindow instance's webContents
 */
const beginDownload = async ({
  currentDownloadItems,
  database,
  downloadIdContext,
  info,
  webContents
}) => {
  // Set the state of downloadIds to `active`
  const {
    downloadIds,
    downloadLocation,
    makeDefaultDownloadLocation
  } = info

  // Update the preferences with the lastDownloadLocation, and defaultDownloadLocation if the
  // user selected this location as the default
  await database.setPreferences({
    lastDownloadLocation: downloadLocation,
    defaultDownloadLocation: makeDefaultDownloadLocation ? downloadLocation : undefined
  })

  let shouldStart = true
  const promises = downloadIds.map(async (downloadId) => {
    const { state } = await database.getDownloadById(downloadId)

    if (state === downloadStates.starting) {
      // Update the download in the database
      await database.updateDownloadById(downloadId, {
        downloadLocation: path.join(downloadLocation, downloadId),
        timeStart: new Date().getTime(),
        state: downloadStates.active
      })
    } else {
      shouldStart = false
    }
  })

  await Promise.all(promises)

  // Start downloading next available active downloads
  if (shouldStart) {
    await startNextDownload({
      currentDownloadItems,
      database,
      downloadIdContext,
      webContents
    })
  }
}

export default beginDownload
