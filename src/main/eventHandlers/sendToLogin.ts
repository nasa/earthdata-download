// @ts-nocheck

import { shell } from 'electron'

import downloadStates from '../../app/constants/downloadStates'

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

    // TODO handle errors opening the authUrl, authUrl not existing
    shell.openExternal(`${authUrl}?fileId=${fileId}`)

    // Send message to renderer to show waiting for login dialog
    webContents.send('showWaitingForLoginDialog', { showDialog: true })
  }

  await database.updateFile(fileId, {
    state: newState,
    timeStart: null
  })
}

export default sendToLogin
