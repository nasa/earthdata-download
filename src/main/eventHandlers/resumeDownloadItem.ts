// @ts-nocheck

import 'array-foreach-async'

import downloadStates from '../../app/constants/downloadStates'
import startNextDownload from '../utils/startNextDownload'
import metricsLogger from '../utils/metricsLogger'
import downloadIdForMetrics from '../utils/downloadIdForMetrics'

/**
 * Resumes a download and updates the database
 * @param {Object} params
 * @param {Object} params.currentDownloadItems CurrentDownloadItems class instance that holds all of the active DownloadItems instances
 * @param {Object} params.database `EddDatabase` instance
 * @param {Object} params.info `info` parameter from ipc message
 */
const resumeDownloadItem = async ({
  currentDownloadItems,
  database,
  downloadIdContext,
  info,
  webContents
}) => {
  const { downloadId, filename } = info

  currentDownloadItems.resumeItem(downloadId, filename)

  if (downloadId && filename) {
    await database.endPause(downloadId, filename)

    await database.updateFilesWhere({
      downloadId,
      filename
    }, {
      state: downloadStates.active
    })
  }

  if (downloadId && !filename) {
    metricsLogger(database, {
      eventType: 'DownloadResume',
      data: {
        downloadIds: [downloadIdForMetrics(downloadId)],
        downloadCount: 1
      }
    })

    await database.endPause(downloadId)

    const numberFiles = await database.getFileCountWhere({ downloadId })

    // If files exist, put the item into active
    let newState = downloadStates.active

    // If no files exist, put the item back into pending
    if (numberFiles === 0) newState = downloadStates.pending

    await database.updateDownloadById(downloadId, {
      state: newState
    })
  }

  if (!downloadId) {
    const downloads = await database.getAllDownloadsWhere({ active: true })
    const downloadIds = []

    await downloads.forEachAsync(async (download) => {
      const { id, state } = download

      await database.endPause(id)

      const numberFiles = await database.getFileCountWhere({ downloadId: id })

      // Default state to active
      let newState = downloadStates.active

      // If the state is paused and there are no files, set to pending
      if (state === downloadStates.paused && numberFiles === 0) newState = downloadStates.pending

      await database.updateDownloadById(id, {
        state: newState
      })

      downloadIds.push(downloadIdForMetrics(id))
    })

    metricsLogger(database, {
      eventType: 'DownloadResume',
      data: {
        downloadIds,
        downloadCount: downloadIds.length
      }
    })
  }

  // If no downloads were paused, call startNextDownload to start pending files
  await startNextDownload({
    currentDownloadItems,
    database,
    downloadIdContext,
    webContents
  })
}

export default resumeDownloadItem
