// @ts-nocheck

import path from 'path'

import sendToLogin from './sendToLogin'
import startNextDownload from '../utils/startNextDownload'

import onDone from './willDownloadEvents/onDone'
import onUpdated from './willDownloadEvents/onUpdated'

import downloadStates from '../../app/constants/downloadStates'
import verifyDownload from '../utils/verifyDownload'
import finishDownload from './willDownloadEvents/finishDownload'
import metricsEvent from '../../app/constants/metricsEvent'
import metricsLogger from '../utils/metricsLogger'

/**
 * Handles the DownloadItem events
 * @param {Object} params
 * @param {Object} params.currentDownloadItems CurrentDownloadItems class instance that holds all of the active DownloadItems instances
 * @param {Object} params.database `EddDatabase` instance
 * @param {Object} params.downloadIdContext Object where we can associate a newly created download to a downloadId
 * @param {Object} params.downloadsWaitingForAuth Object where we can mark a downloadId as waiting for authentication
 * @param {Object} params.downloadsWaitingForEula Object where we can mark a downloadId as waiting for EULA acceptance
 * @param {Object} params.item Electron DownloadItem class instance
 * @param {Object} params.webContents Electron BrowserWindow instance's webContents
 */
const willDownload = async ({
  currentDownloadItems,
  database,
  downloadIdContext,
  downloadsWaitingForAuth,
  downloadsWaitingForEula,
  item,
  webContents
}) => {
  const [originalUrl] = item.getURLChain()
  const context = downloadIdContext[originalUrl]

  const filename = item.getFilename()
  const receivedBytes = item.getReceivedBytes()
  const totalBytes = item.getTotalBytes()

  // If no downloadIdContext is available for this download, cancel the download
  if (!context) {
    item.cancel()

    return
  }

  const {
    downloadId,
    downloadLocation,
    fileId
  } = context

  // Add the DownloadItem to the currentDownloadItems
  currentDownloadItems.addItem(downloadId, filename, item)

  // Setup event handlers for the download item
  item.on('updated', async (event, state) => {
    await onUpdated({
      database,
      downloadId,
      item,
      state
    })
  })

  item.once('done', async (event, state) => {
    await onDone({
      currentDownloadItems,
      database,
      downloadId,
      downloadIdContext,
      item,
      state,
      webContents
    })
  })

  // Set the save path for the DownloadItem
  item.setSavePath(path.join(downloadLocation, filename))

  // If the download has been cancelled, cancel this file
  const { state: downloadState } = await database.getDownloadById(downloadId)
  if (downloadState === downloadStates.cancelled) {
    console.log(`The download was already cancelled, cancelling the file ${originalUrl}`)

    currentDownloadItems.cancelItem(downloadId, filename)

    return
  }

  // If the download has been paused, pause this file
  if (downloadState === downloadStates.paused) {
    currentDownloadItems.pauseItem(downloadId, filename)

    return
  }

  // eslint-disable-next-line no-param-reassign
  delete downloadIdContext[originalUrl]

  const urlChain = item.getURLChain()
  const lastUrl = urlChain.pop()

  // If the last item in the urlChain is EDL, set the download to pending and forward the user to EDL
  if (lastUrl.includes('oauth/authorize')) {
    console.log(`The download for ${originalUrl} was redirected to ${lastUrl}, sending the user to login. URL chain: ${JSON.stringify(urlChain)}`)

    currentDownloadItems.cancelItem(downloadId, filename)

    await database.updateDownloadById(downloadId, {
      state: downloadStates.waitingForAuth
    })

    await sendToLogin({
      database,
      downloadsWaitingForAuth,
      info: {
        downloadId,
        fileId
      },
      webContents
    })

    return
  }

  const downloadCheck = await verifyDownload({
    database,
    downloadId,
    downloadsWaitingForAuth,
    downloadsWaitingForEula,
    fileId,
    url: lastUrl,
    webContents
  })

  const { state: fileState } = await database.getFileWhere({
    downloadId,
    filename
  })
  const isFileActive = fileState === downloadStates.active
  const isDownloadActive = downloadState === downloadStates.active

  // If the `verifyDownload` check failed, cancel the download.
  if (isFileActive && isDownloadActive && !downloadCheck) {
    console.log(`The verifyDownload check failed, cancelling the download for ${originalUrl}`)

    currentDownloadItems.cancelItem(downloadId, filename)

    return
  }

  // If the file has no totalBytes, report an error
  if (isFileActive && isDownloadActive && totalBytes === 0) {
    console.log(`The download for ${originalUrl} has a totalBytes of ${totalBytes}. Cancelling the download.`)

    metricsLogger(database, {
      eventType: metricsEvent.downloadErrored,
      data: {
        downloadId,
        filename,
        reason: 'File reported a size of 0 bytes.'
      }
    })

    await database.updateFileById(fileId, {
      state: downloadStates.error,
      errors: 'This file could not be downloaded'
    })

    currentDownloadItems.cancelItem(downloadId, filename)

    // Start the next download
    await startNextDownload({
      currentDownloadItems,
      database,
      downloadId,
      downloadIdContext,
      webContents
    })

    return
  }

  if (totalBytes > 0 && receivedBytes === totalBytes) {
    // The file is already done, mark it as completed
    await database.updateFileById(fileId, {
      percent: 100,
      state: downloadStates.completed,
      timeStart: new Date().getTime(),
      timeEnd: new Date().getTime()
    })

    // Start the next download
    await startNextDownload({
      currentDownloadItems,
      database,
      downloadId,
      downloadIdContext,
      webContents
    })

    // Finish the download
    await finishDownload({
      database,
      downloadId
    })

    return
  }

  // Update the start time for the file
  await database.updateFileById(fileId, {
    timeStart: new Date().getTime()
  })
}

export default willDownload
