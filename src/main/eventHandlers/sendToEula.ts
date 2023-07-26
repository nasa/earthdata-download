// @ts-nocheck

import { shell } from 'electron'

import downloadStates from '../../app/constants/downloadStates'

/**
 * Sends the user to the download's eulaUrl to get a new token
 * @param {Object} params
 * @param {Object} params.database `EddDatabase` instance
 * @param {Object} params.downloadsWaitingForEula Object where we can mark a downloadId as waiting for authentication
 * @param {Object} params.info `info` parameter from ipc message
 * @param {Object} params.webContents Electron BrowserWindow instance's webContents
 */
const sendToEula = async ({
  database,
  downloadsWaitingForEula,
  info,
  webContents
}) => {
  const {
    downloadId,
    fileId: providedFileId,
    forceLogin = false
  } = info

  let fileId = providedFileId

  // If no fileId was provided, find the file that is waitingForEula for the downloadId
  if (!providedFileId) {
    ({ id: fileId } = await database.getFileWhere({
      downloadId,
      state: downloadStates.waitingForEula
    }))
  }

  let newState = downloadStates.waitingForEula

  if (downloadsWaitingForEula[downloadId] && !forceLogin) {
    // A file is already waiting for eula, don't open the eulaUrl
    newState = downloadStates.pending
  } else {
    // eslint-disable-next-line no-param-reassign
    downloadsWaitingForEula[downloadId] = true
    const download = await database.getDownloadById(downloadId)

    const {
      // eulaUrl comes from the 403 response
      eulaUrl,
      // eulaRedirectUrl comes from EDSC, should point to EDSC auth_callback
      eulaRedirectUrl
    } = download

    // Pull `eddRedirect` out of `authUrl` and add `fileId` to it
    const url = new URL(eulaRedirectUrl)
    const { searchParams } = url
    const eddRedirect = searchParams.get('eddRedirect')

    const eddRedirectUrl = new URL(eddRedirect)
    eddRedirectUrl.searchParams.set('fileId', fileId)

    // Update the eddRedirect parameter with the `fileId` added
    url.searchParams.set('eddRedirect', eddRedirectUrl.toString())

    // eulaRedirectUrl `redirect` param needs to know the fileId
    const eulaRedirectUrlWithFileId = url.toString()
    const eulaRedirect = `${eulaUrl}&redirect_uri=${encodeURIComponent(eulaRedirectUrlWithFileId)}`

    shell.openExternal(eulaRedirect)

    // Send message to renderer to show waiting for eula dialog
    webContents.send('showWaitingForEulaDialog', { showDialog: true })
  }

  await database.updateFileById(fileId, {
    state: newState,
    timeStart: null
  })
}

export default sendToEula
