// @ts-nocheck

import fetchLinks from '../utils/fetchLinks'
import restartAuthDownload from '../utils/restartAuthDownload'

// const setToken = async ({
//   database,
//   webContents
// }) => {
//   const token = await database.getToken()
//   console.log('🚀 ~ file: openUrl.ts:11 ~ token:', token)

//   webContents.session.webRequest.onBeforeSendHeaders((details, callback) => {
//     // eslint-disable-next-line no-param-reassign
//     details.requestHeaders.Authorization = `Bearer ${token}`
//     // delete details.requestHeaders['Authorization']
//     callback({ requestHeaders: details.requestHeaders })
//   })
// }

/**
 * Parses `deepLink` for info and fetches download links
 * @param {Object} params
 * @param {Object} params.appWindow Electron window instance
 * @param {Object} params.currentDownloadItems CurrentDownloadItems class instance that holds all of the active DownloadItems instances
 * @param {Object} params.database `EddDatabase` instance
 * @param {String} params.deepLink URL used to open EDD
 * @param {Object} params.downloadIdContext Object where we can associated a newly created download to a downloadId
 */
const openUrl = async ({
  appWindow,
  // currentDownloadItems,
  database,
  deepLink,
  downloadIdContext
}) => {
  const url = new URL(deepLink)
  const {
    hostname,
    searchParams
  } = url

  if (hostname === 'startDownload') {
    const getLinks = searchParams.get('getLinks')
    const downloadId = searchParams.get('downloadId')
    const token = searchParams.get('token')
    const reAuthUrl = searchParams.get('reAuthUrl')

    fetchLinks({
      appWindow,
      database,
      downloadId,
      getLinks,
      reAuthUrl,
      token
    })
  }

  // TODO not being used as of I&A
  if (hostname === 'reAuthCallback') {
    const token = searchParams.get('token')
    const fileId = searchParams.get('fileId')

    await database.setToken(token)

    // TODO need to put the download into an 'auth' state
    // instead of startNextDownload, need to restart the 'auth'/'starting' download

    await restartAuthDownload({
      database,
      downloadIdContext,
      fileId,
      webContents: appWindow.webContents
    })
  }
}

export default openUrl
