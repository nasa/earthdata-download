// @ts-nocheck

import downloadStates from '../../app/constants/downloadStates'

const restartAuthDownload = async ({
  database,
  downloadIdContext,
  fileId,
  webContents
}) => {
  // Find the file that is waitingForAuth
  const file = await database.getFileWhere({
    fileId
  })
  const {
    downloadId,
    url
  } = file

  const download = await database.getDownloadById(downloadId)
  const { downloadLocation } = download

  await database.updateDownloadById(downloadId, {
    state: downloadStates.active
  })

  await database.updateFile(fileId, {
    state: downloadStates.starting
  })

  // Start downloading that file
  // eslint-disable-next-line no-param-reassign
  downloadIdContext[url] = {
    downloadId,
    downloadLocation,
    fileId
  }
  webContents.downloadURL(url)
}

export default restartAuthDownload
