// @ts-nocheck

import { shell } from 'electron'

import downloadStates from '../../app/constants/downloadStates'
import metricsEvent from '../../app/constants/metricsEvent'
import metricsLogger from '../utils/metricsLogger'

/**
 * Sends the user to the download's authUrl to get a new token
 * @param {Object} params
 * @param {Object} params.database `EddDatabase` instance
 * @param {Object} params.downloadsWaitingForAuth Object where we can mark a downloadId as waiting for authentication
 * @param {Object} params.info `info` parameter from ipc message
 * @param {Object} params.webContents Electron BrowserWindow instance's webContents
 */
const sendToLogin = async ({
  database,
  downloadsWaitingForAuth,
  info,
  webContents
}) => {
  const {
    downloadId,
    fileId: providedFileId,
    forceLogin = false
  } = info

  let fileId = providedFileId

  // If no fileId was provided, find the file that is waitingForAuth for the downloadId
  if (!providedFileId) {
    ({ id: fileId } = await database.getFileWhere({
      downloadId,
      state: downloadStates.waitingForAuth
    }))
  }

  let newState = downloadStates.waitingForAuth

  if (downloadsWaitingForAuth[downloadId] && !forceLogin) {
    // A file is already waiting for auth, don't open the authUrl
    newState = downloadStates.pending
  } else {
    // eslint-disable-next-line no-param-reassign
    downloadsWaitingForAuth[downloadId] = true
    const download = await database.getDownloadById(downloadId)

    const {
      authUrl
    } = download

    // Pull `eddRedirect` out of `authUrl` and add `fileId` to it
    const url = new URL(authUrl)
    const { searchParams } = url
    const eddRedirect = searchParams.get('eddRedirect')

    const eddRedirectUrl = new URL(eddRedirect)
    eddRedirectUrl.searchParams.set('fileId', fileId)

    // Update the eddRedirect parameter with the `fileId` added
    url.searchParams.set('eddRedirect', eddRedirectUrl.toString())

    // TODO handle errors opening the authUrl, authUrl not existing
    shell.openExternal(url.toString())

    // Send message to renderer to show waiting for login dialog
    webContents.send('showWaitingForLoginDialog', {
      downloadId,
      showDialog: true
    })

    metricsLogger(database, {
      eventType: metricsEvent.sentToEdl,
      data: {
        downloadId
      }
    })
  }

  await database.updateFileById(fileId, {
    state: newState,
    timeStart: null
  })
}

export default sendToLogin
