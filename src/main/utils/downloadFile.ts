// @ts-nocheck

import downloadStates from '../../app/constants/downloadStates'

/**
 * Starts a download of the given file
 * @param {Object} params
 * @param {Object} params.database `EddDatabase` instance
 * @param {Object} params.downloadIdContext Object where we can associate a newly created download to a downloadId
 * @param {Object} params.file File to start downloading
 * @param {Object} params.webContents Electron BrowserWindow instance's webContents
 */
const downloadFile = async ({
  database,
  downloadIdContext,
  file,
  webContents
}) => {
  const { token } = await database.getToken()

  const {
    downloadId,
    id: fileId,
    url
  } = file

  const { downloadLocation } = await database.getDownloadById(downloadId)

  // The file might not actually start download before the next time through this loop
  // Setting the file to `starting` ensures we start a new file if we need to
  await database.updateFileById(fileId, {
    state: downloadStates.starting
  })

  // eslint-disable-next-line no-param-reassign
  downloadIdContext[url] = {
    downloadId,
    downloadLocation,
    fileId
  }

  let bearerToken
  if (token) bearerToken = `Bearer ${token}`

  webContents.downloadURL(url, {
    headers: {
      Authorization: bearerToken
    }
  })
}

export default downloadFile
