// @ts-nocheck

import downloadIdForMetrics from './downloadIdForMetrics'

/**
 * Builds JSON Object with clientId and downloadId for given download
 * @param {Object} params.database `EddDatabase` instance
 * @param {String} params.downloadId downloadId for a given download
 */
const getClientIdWithDownloadId = async ({ database, downloadId }) => {
  try {
    const { clientId } = await database.getDownloadById(downloadId)
    const metricId = downloadIdForMetrics(downloadId)

    return {
      clientId,
      downloadId: metricId
    }
  } catch (error) {
    console.log(`Error in getClientIdWithDownloadId called with downloadId: ${downloadId}, error: ${error}`)

    return {
      clientId: null,
      downloadId
    }
  }
}

export default getClientIdWithDownloadId
