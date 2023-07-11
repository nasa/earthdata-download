// @ts-nocheck

import downloadStates from '../../app/constants/downloadStates'

const downloadFile = async ({
  database,
  downloadIdContext,
  file,
  webContents
}) => {
  console.log('🚀 ~ file: downloadFile.ts:11 ~ file:', file)
  const { token } = await database.getToken()

  const {
    downloadId,
    id: fileId,
    url
  } = file

  const { downloadLocation } = await database.getDownloadById(downloadId)

  // The file might not actually start download before the next time through this loop
  // Setting the file to `starting` ensures we start a new file if we need to
  await database.updateFile(fileId, {
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
