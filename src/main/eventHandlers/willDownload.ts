// @ts-nocheck

import { shell } from 'electron'
import path from 'path'

import onDone from './willDownloadEvents/onDone'
import onUpdated from './willDownloadEvents/onUpdated'

import downloadStates from '../../app/constants/downloadStates'

/**
 * Handles the DownloadItem events
 * @param {Object} params
 * @param {Object} params.currentDownloadItems CurrentDownloadItems class instance that holds all of the active DownloadItems instances
 * @param {Object} params.database `EddDatabase` instance
 * @param {Object} params.downloadIdContext Object where we can associate a newly created download to a downloadId
 * @param {Object} params.downloadsWaitingForAuth Object where we can mark a downloadId as waiting for authentication
 * @param {Object} params.item Electron DownloadItem class instance
 * @param {Object} params.webContents Electron BrowserWindow instance's webContents
 */
const willDownload = async ({
  currentDownloadItems,
  database,
  downloadIdContext,
  downloadsWaitingForAuth,
  item,
  webContents
}) => {
  const [originalUrl] = item.getURLChain()

  const context = downloadIdContext[originalUrl]

  // If no downloadIdContext is available for this download, cancel the download
  if (!context) {
    item.cancel()
    return
  }

  const {
    downloadId,
    downloadLocation,
    fileId
  } = context

  const filename = item.getFilename()

  // Set the save path for the DownloadItem
  item.setSavePath(path.join(downloadLocation, filename))

  // eslint-disable-next-line no-param-reassign
  delete downloadIdContext[originalUrl]

  const urlChain = item.getURLChain()
  const lastUrl = urlChain.pop()

  // If the last item in the urlChain is EDL, set the download to pending and forward the user to EDL
  if (lastUrl.includes('oauth/authorize')) {
    item.cancel()

    await database.updateDownloadById(downloadId, {
      state: downloadStates.waitingForAuth
    })

    let newState = downloadStates.waitingForAuth

    if (downloadsWaitingForAuth[downloadId]) {
      // A file is already waiting for auth, don't open the authUrl
      newState = downloadStates.pending
    } else {
      // eslint-disable-next-line no-param-reassign
      downloadsWaitingForAuth[downloadId] = true
      const download = await database.getDownloadById(downloadId)

      const {
        authUrl
      } = download

      shell.openExternal(`${authUrl}?fileId=${fileId}`)
    }

    await database.updateFile(fileId, {
      state: newState,
      timeStart: null
    })

    return
  }

  // Add the DownloadItem to the currentDownloadItems
  currentDownloadItems.addItem(downloadId, filename, item)

  // Update the start time for the file
  await database.updateFile(fileId, {
    timeStart: new Date().getTime()
  })

  // Setup event handlers for the download item
  item.on('updated', async (event, state) => {
    await onUpdated({
      database,
      downloadId,
      item,
      state
    })
  })

  item.once('done', async (event, state) => {
    await onDone({
      currentDownloadItems,
      database,
      downloadId,
      downloadIdContext,
      item,
      state,
      webContents
    })
  })
}

export default willDownload
