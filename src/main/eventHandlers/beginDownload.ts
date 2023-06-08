// @ts-nocheck

import path from 'path'

import startNextDownload from './willDownloadEvents/startNextDownload'

import downloadStates from '../../app/constants/downloadStates'

/**
 * Updates the downloadIds within `info` to active and starts downloads
 * @param {Object} params
 * @param {Object} params.currentDownloadItems CurrentDownloadItems class instance that holds all of the active DownloadItems instances
 * @param {Object} params.downloadIdContext Object where we can associated a newly created download to a downloadId
 * @param {Object} params.info `info` parameter from ipc message
 * @param {Object} params.store `electron-store` instance
 * @param {Object} params.webContents Electron BrowserWindow instance's webContents
 */
const beginDownload = ({
  currentDownloadItems,
  downloadIdContext,
  info,
  store,
  webContents
}) => {
  // Set the state of downloadIds to `active`
  const {
    downloadIds,
    downloadLocation,
    makeDefaultDownloadLocation
  } = info

  const preferences = store.get('preferences')

  // Update the preferences with the lastDownloadLocation, and defaultDownloadLocation if the
  // user selected this location as the default
  store.set('preferences', {
    ...preferences,
    lastDownloadLocation: downloadLocation,
    defaultDownloadLocation: makeDefaultDownloadLocation ? downloadLocation : undefined
  })

  downloadIds.forEach((downloadId) => {
    const download = store.get(`downloads.${downloadId}`)
    store.set(`downloads.${downloadId}`, {
      ...download,
      downloadLocation: path.join(downloadLocation, downloadId.replaceAll('\\.', '.')),
      timeStart: new Date().getTime(),
      state: downloadStates.active
    })
  })

  const [firstDownloadId] = downloadIds

  // Start downloading next available active downloads
  startNextDownload({
    currentDownloadItems,
    downloadId: firstDownloadId,
    downloadIdContext,
    store,
    webContents
  })
}

export default beginDownload
