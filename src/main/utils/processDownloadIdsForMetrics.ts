// @ts-nocheck

import getClientIdWithDownloadId from './getClientIdWithDownloadId'

/**
 * Builds list of JSON Objects with clientId and downloadId for given download
 * @param {Object} params.database `EddDatabase` instance
 * @param {Array} params.downloadIds Download IDs to be initialized
 */
const processDownloadIdsForMetrics = ({ database, downloadIds }) => Promise.all(
  downloadIds.map(async (downloadId) => getClientIdWithDownloadId({
    database,
    downloadId
  }))
)

export default processDownloadIdsForMetrics
