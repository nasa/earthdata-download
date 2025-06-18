// @ts-nocheck

import downloadStates from '../../../app/constants/downloadStates'
import metricsEvent from '../../../app/constants/metricsEvent'
import metricsLogger from '../../utils/metricsLogger'
import downloadIdForMetrics from '../../utils/downloadIdForMetrics'

/**
 * Handles the DownloadItem 'updated' event
 * @param {Object} params
 * @param {Object} params.database `EddDatabase` instance
 * @param {String} params.downloadId downloadId of the DownloadItem being downloaded
 * @param {Object} params.item Electron DownloadItem class instance
 * @param {String} params.state Updated state of the DownloadItem
 */
const onUpdated = async ({
  database,
  downloadId,
  item,
  state
}) => {
  const filename = item.getFilename()

  // Get the download item from the database
  const file = await database.getFileWhere({
    filename,
    downloadId
  })

  // If the file is not found in the database, cancel the download
  if (!file) {
    item.cancel()

    return
  }

  const {
    id: fileId
  } = file

  // Calculate the percent done of the download
  const receivedBytes = item.getReceivedBytes()
  const totalBytes = item.getTotalBytes()

  let percentDone = 0

  // Avoid NaN by only calculating percentDone if totalBytes is known
  if (totalBytes > 0) {
    percentDone = Math.floor((receivedBytes / totalBytes) * 100)
  }

  if (state === 'interrupted') {
    metricsLogger(database, {
      eventType: metricsEvent.downloadInterrupted,
      data: {
        downloadId: downloadIdForMetrics(downloadId),
        filename
      }
    })

    await database.createPauseByDownloadIdAndFilename(downloadId, filename)

    // Update the database if the state has updated to interrupted
    await database.updateFileById(fileId, {
      state: downloadStates.interrupted,
      percent: percentDone
    })

    // Create a pause for the download
    await database.createPauseByDownloadId(downloadId, false)

    // Set the download to interrupted
    await database.updateDownloadById(downloadId, {
      state: downloadStates.interrupted
    })
  } else if (state === 'progressing') {
    // Update the database with the percent and state
    await database.updateFileById(fileId, {
      state: item.isPaused() ? downloadStates.paused : downloadStates.active,
      percent: percentDone,
      receivedBytes,
      totalBytes
    })
  }
}

export default onUpdated
