// @ts-nocheck

import startNextDownload from '../utils/startNextDownload'
import startPendingDownloads from '../utils/startPendingDownloads'

import downloadStates from '../../app/constants/downloadStates'

/**
 * Parses `deepLink` for info and fetches download links
 * @param {Object} params
 * @param {Object} params.appWindow Electron window instance
 * @param {Object} params.currentDownloadItems CurrentDownloadItems class instance that holds all of the active DownloadItems instances
 * @param {Object} params.database `EddDatabase` instance
 * @param {String} params.deepLink URL used to open EDD
 * @param {Object} params.downloadIdContext Object where we can associate a newly created download to a downloadId
 * @param {Object} params.downloadsWaitingForAuth Object where we can mark a downloadId as waiting for authentication
 * @param {Object} params.webContents Electron BrowserWindow instance's webContents
 */
const openUrl = async ({
  appWindow,
  currentDownloadItems,
  database,
  deepLink,
  downloadIdContext,
  downloadsWaitingForAuth,
  downloadsWaitingForEula,
  updateAvailable
}) => {
  const url = new URL(deepLink)
  const {
    hostname,
    searchParams
  } = url

  // Start a new download
  if (hostname === 'startDownload') {
    const authUrl = searchParams.get('authUrl')
    const downloadIdWithoutTime = searchParams.get('downloadId')
    const eulaRedirectUrl = searchParams.get('eulaRedirectUrl')
    const getLinksToken = searchParams.get('token')
    const getLinksUrl = searchParams.get('getLinks')

    const now = new Date()
      .toISOString()
      .replace(/(:|-)/g, '')
      .replace('T', '_')
      .split('.')[0]

    const downloadIdWithoutTimeFormatted = downloadIdWithoutTime.replace(/\s/g, '_')

    const downloadId = `${downloadIdWithoutTimeFormatted}-${now}`

    // Create a download in the database
    await database.createDownload(downloadId, {
      authUrl,
      createdAt: new Date().getTime(),
      eulaRedirectUrl,
      getLinksToken,
      getLinksUrl,
      state: downloadStates.pending
    })

    // If an app update is not available, start fetching links
    // Check for false as value is initialized as undefined
    if (updateAvailable === false) {
      await startPendingDownloads({
        appWindow,
        database
      })
    }
  }

  // User has been authenticated, save the new token and start the download
  if (hostname === 'authCallback') {
    const token = searchParams.get('token')
    const fileId = searchParams.get('fileId')

    // Save the new token in the database
    await database.setToken(token)

    const { downloadId } = await database.getFileWhere({ id: fileId })

    // Remove the download from `downloadsWaitingForAuth`
    // eslint-disable-next-line no-param-reassign
    delete downloadsWaitingForAuth[downloadId]

    // Update the download to be active
    await database.updateDownloadById(downloadId, {
      state: downloadStates.active
    })

    // Close the waiting dialog
    appWindow.webContents.send('showWaitingForLoginDialog', { showDialog: false })

    // Restart the fileId that was waitingForAuth
    await startNextDownload({
      currentDownloadItems,
      database,
      downloadIdContext,
      fileId,
      webContents: appWindow.webContents
    })
  }

  // User has accepted a EULA, start the download
  if (hostname === 'eulaCallback') {
    const fileId = searchParams.get('fileId')

    const { downloadId } = await database.getFileWhere({ id: fileId })

    // Remove the download from `downloadsWaitingForEula`
    // eslint-disable-next-line no-param-reassign
    delete downloadsWaitingForEula[downloadId]

    // Update the download to be active
    await database.updateDownloadById(downloadId, {
      state: downloadStates.active
    })

    // Close the waiting dialog
    appWindow.webContents.send('showWaitingForEulaDialog', { showDialog: false })

    // Restart the fileId that was waitingForEula
    await startNextDownload({
      currentDownloadItems,
      database,
      downloadIdContext,
      fileId,
      webContents: appWindow.webContents
    })
  }
}

export default openUrl
