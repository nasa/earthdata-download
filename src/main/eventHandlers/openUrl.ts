// @ts-nocheck

import downloadIdForMetrics from '../utils/downloadIdForMetrics'
import metricsLogger from '../utils/metricsLogger'
import startNextDownload from '../utils/startNextDownload'
import startPendingDownloads from '../utils/startPendingDownloads'

import downloadStates from '../../app/constants/downloadStates'

/**
 * Check the given hostname against the expected value in a case-insensitive
 * manner.
 * @param {String} hostname String representing the hostname from a URL
 * @param {String} expected String representing the expected hostname
 */
export const checkHostname = (hostname: string, expected: string): boolean => (
  hostname.toLowerCase() === expected.toLowerCase()
)

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
  if (checkHostname(hostname, 'startDownload')) {
    const authUrl = searchParams.get('authUrl')
    const downloadIdWithoutTime = searchParams.get('downloadId')
    const eulaRedirectUrl = searchParams.get('eulaRedirectUrl')
    const getLinksToken = searchParams.get('token')
    const getLinksUrl = searchParams.get('getLinks')
    const clientId = searchParams.get('clientId')

    // Logging out the `deepLink` was tricky to try to remove any tokens in the URL. Instead we are using this
    // `paramsToLog` object of all the expected parameters and logging out the object. If a new parameter is added
    // at some point it should also be added to this object to be logged
    const paramsToLog = {
      authUrl,
      clientId,
      downloadId: downloadIdWithoutTime,
      eulaRedirectUrl,
      getLinks: getLinksUrl,
      hostname,
      token: 'REDACTED'
    }
    console.log(`Opening URL: ${JSON.stringify(paramsToLog)}`)

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

    metricsLogger(database, {
      eventType: 'OpenUrl',
      data: {
        clientId,
        downloadId: downloadIdForMetrics(downloadId)
      }
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
  if (checkHostname(hostname, 'authCallback')) {
    const token = searchParams.get('token')
    const fileId = searchParams.get('fileId')

    // Logging out the `deepLink` was tricky to try to remove any tokens in the URL. Instead we are using this
    // `paramsToLog` object of all the expected parameters and logging out the object. If a new parameter is added
    // at some point it should also be added to this object to be logged
    const paramsToLog = {
      hostname,
      fileId,
      token: 'REDACTED'
    }
    console.log(`Opening URL: ${JSON.stringify(paramsToLog)}`)

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
  if (checkHostname(hostname, 'eulacallback')) {
    const fileId = searchParams.get('fileId')

    // Logging out the `deepLink` was tricky to try to remove any tokens in the URL. Instead we are using this
    // `paramsToLog` object of all the expected parameters and logging out the object. If a new parameter is added
    // at some point it should also be added to this object to be logged
    const paramsToLog = {
      hostname,
      fileId
    }
    console.log(`Opening URL: ${JSON.stringify(paramsToLog)}`)

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
