// @ts-nocheck

import downloadStates from '../../../app/constants/downloadStates'

/**
 * If no more files are active, mark the download as interrupted
 * @param {Object} params
 * @param {Object} params.database `EddDatabase` instance
 * @param {Object} params.downloadId downloadId of the DownloadItem being downloaded
 */
const setInterruptedDownload = async ({
  database,
  downloadId
}) => {
  const activeFilesCount = await database
    .getActiveFilesCountByDownloadId(downloadId)

  // If no files remain that aren't interrupted or
  if (activeFilesCount === 0) {
    await database.createPauseByDownloadId(downloadId, false)

    await database.updateDownloadById(downloadId, {
      state: downloadStates.interrupted
    })
  }
}

export default setInterruptedDownload
