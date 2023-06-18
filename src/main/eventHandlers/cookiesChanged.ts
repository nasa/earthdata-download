// @ts-nocheck

import startNextDownload from './willDownloadEvents/startNextDownload'

import downloadStates from '../../app/constants/downloadStates'

/**
 * Called when the session cookies have changed. Will close the authWindow and restart downloads if the auth cookie is set
 * @param {Object} params
 * @param {Object} params.currentDownloadItems CurrentDownloadItems class instance that holds all of the active DownloadItems instances
 * @param {Object} params.authWindow Electron BrowserWindow instance used for EDL auth redirects
 * @param {Object} params.database `EddDatabase` instance
 * @param {Object} params.downloadIdContext Object where we can associated a newly created download to a downloadId
 * @param {Object} params.cookie Cookie data
 * @param {Boolean} params.removed Was the cookie removed from the session
 * @param {Object} params.webContents Electron BrowserWindow instance's webContents
 */
const cookiesChanged = async ({
  currentDownloadItems,
  authWindow,
  database,
  downloadIdContext,
  cookie,
  removed,
  webContents
}) => {
  const {
    name,
    domain
  } = cookie

  // If the auth cookie was set, close the window and restart the download
  if (name === 'asf-urs' && !removed) {
    // Find waitingForAuth file with a url that matches cookie domain
    const file = await database.getFileWaitingForAuthWhereUrlLike(domain)

    // If file exists, close the authWindow and start downloading that file
    if (file) {
      authWindow.close()

      const {
        downloadId,
        id: fileId
      } = file

      await database.updateDownloadById(downloadId, {
        state: downloadStates.active,
        timeStart: new Date().getTime()
      })

      await startNextDownload({
        currentDownloadItems,
        database,
        downloadIdContext,
        fileId,
        webContents
      })
    }
  }
}

export default cookiesChanged
