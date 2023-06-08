// @ts-nocheck

import fetchLinks from '../utils/fetchLinks'

/**
 * Parses `deepLink` for info and fetches download links
 * @param {Object} params
 * @param {Object} params.appWindow Electron window instance
 * @param {String} params.deepLink URL used to open EDD
 * @param {Object} params.store `electron-store` instance
 */
const openUrl = ({
  appWindow,
  deepLink,
  store
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

    fetchLinks({
      downloadId,
      getLinks,
      store,
      token,
      appWindow
    })
  }
}

export default openUrl
