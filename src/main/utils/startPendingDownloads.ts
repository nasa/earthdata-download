// @ts-nocheck

import downloadStates from '../../app/constants/downloadStates'
import fetchLinks from './fetchLinks'

/**
 * Calls `fetchLinks` for any downloads in the `pending` state
 * @param {Object} params
 * @param {Object} params.appWindow Electron window instance
 * @param {Object} params.database `EddDatabase` instance
 */
const startPendingDownloads = async ({
  appWindow,
  database
}) => {
  // Find any pending downloads
  const pendingDownloads = await database.getDownloadsWhere({
    state: downloadStates.pending
  })

  // Start fetching links for those pending downloads
  const promises = pendingDownloads.map(async (download) => {
    const {
      id: downloadId,
      getLinksToken,
      getLinksUrl
    } = download

    await fetchLinks({
      appWindow,
      database,
      downloadId,
      getLinksToken,
      getLinksUrl
    })
  })

  await Promise.all(promises)
}

export default startPendingDownloads
