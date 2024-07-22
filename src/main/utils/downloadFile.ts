// @ts-nocheck

import { session } from 'electron'

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

  // Thin Egress App sets a cookie, but we want to ensure a token is validated for each request, so clear cookies
  // before downloading
  await session.defaultSession.clearStorageData()

  let headers = {}
  if (token) {
    headers = {
      Authorization: `Bearer ${token}`
    }
  }

  console.log(`Starting a download for ${url}, with a token: ${token ? 'Yes' : 'No'}`)

  webContents.downloadURL(url, { headers })
}

export default downloadFile
