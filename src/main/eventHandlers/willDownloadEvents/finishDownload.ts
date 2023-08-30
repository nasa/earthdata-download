// @ts-nocheck

import downloadStates from '../../../app/constants/downloadStates'

/**
 * If no more files are not completed, mark the download as completed
 * @param {Object} params
 * @param {Object} params.database `EddDatabase` instance
 * @param {Object} params.downloadId downloadId of the DownloadItem being downloaded
 */
const finishDownload = async ({
  database,
  downloadId
}) => {
  const notCompleteFilesCount = await database.getNotCompletedFilesCountByDownloadId(downloadId)

  if (notCompleteFilesCount === 0) {
    // TODO this is causing the time to move when completed because the sum is adding to the elapsedTime
    // ? Maybe create a pause after a file is restarted and the timeEnd gets removed?
    // Create a pause for the download. If a file is restarted later the pause will end
    // and account for the time it sat completed
    // await database.createPauseByDownloadId(downloadId)

    await database.updateDownloadById(downloadId, {
      timeEnd: new Date().getTime(),
      state: downloadStates.completed
    })
  }
}

export default finishDownload
