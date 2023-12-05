// @ts-nocheck

import { app } from 'electron'

import metricsLogger from './metricsLogger'
import downloadIdForMetrics from '../utils/downloadIdForMetrics'

/**
 * Sends a message to the renderer process to start a download for the given downloadIds.
 * @param {Object} params
 * @param {Object} params.appWindow Electron window instance
 * @param {Object} params.database `EddDatabase` instance
 * @param {Array} params.downloadIds Download IDs to be initialized
 */
const initializeDownload = async ({
  database,
  downloadIds,
  webContents
}) => {
  if (downloadIds.length > 0) {
    // Default the download location to the user's `downloads` folder
    let location = app.getPath('downloads')

    // Pull preferences out of the database
    const {
      defaultDownloadLocation,
      lastDownloadLocation
    } = await database.getPreferences()

    // If there is a lastDownloadLocation, use that location
    if (lastDownloadLocation) {
      location = lastDownloadLocation
    }

    // If there is a defaultDownloadLocation, use that location
    if (defaultDownloadLocation) {
      location = defaultDownloadLocation
    }

    // Send a message to the renderer to initialize the download
    webContents.send('initializeDownload', {
      downloadIds,
      downloadLocation: location,
      shouldUseDefaultLocation: !!defaultDownloadLocation
    })

    const metricIds = downloadIds.map(downloadIdForMetrics)
    metricsLogger({
      eventType: 'DownloadStarted',
      data: {
        downloadIds: metricIds
      }
    })
  }
}

export default initializeDownload
