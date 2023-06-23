// @ts-nocheck

import fetchLinks from '../utils/fetchLinks'
import startNextDownload from '../utils/startNextDownload'
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
 */
const openUrl = async ({
  appWindow,
  currentDownloadItems,
  database,
  deepLink,
  downloadIdContext,
  downloadsWaitingForAuth
}) => {
  const url = new URL(deepLink)
  const {
    hostname,
    searchParams
  } = url

  // Start a new download
  if (hostname === 'startDownload') {
    const getLinks = searchParams.get('getLinks')
    const downloadId = searchParams.get('downloadId')
    const token = searchParams.get('token')
    const authUrl = searchParams.get('authUrl')

    fetchLinks({
      appWindow,
      database,
      downloadId,
      getLinks,
      authUrl,
      token
    })
  }

  // User has re-authenticated, save the new token and start the download
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

    // Restart the fileId that was waitingForAuth
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
