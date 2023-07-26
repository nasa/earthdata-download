// @ts-nocheck

import fetch from 'node-fetch'

import AbortController from 'abort-controller'

import downloadStates from '../../app/constants/downloadStates'
import sendToEula from '../eventHandlers/sendToEula'

/**
 * Verify the download works and log any errors. Also redirects the user to accept a EULA if that is detected.
 * @param {Object} params
 * @param {Object} params.database `EddDatabase` instance
 * @param {String} params.downloadId downloadId of the DownloadItem being downloaded
 * @param {Object} params.downloadsWaitingForEula Object where we can mark a downloadId as waiting for EULA acceptance
 * @param {Number} params.fileId Optional file ID to start downloading
 * @param {String} params.url URL to verify
 * @param {Object} params.webContents Electron BrowserWindow instance's webContents
 */
const verifyDownload = async ({
  database,
  downloadId,
  downloadsWaitingForEula,
  fileId,
  url,
  webContents
}) => {
  if (downloadsWaitingForEula[downloadId]) return false

  const { token } = await database.getToken()

  const headers = {}

  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  const controller = new AbortController()

  let response
  try {
    response = await fetch(url, {
      method: 'GET',
      headers,
      signal: controller.signal,
      follow: 20,
      size: 250
    })

    if (response.ok) {
      // The response was good, abort the request and return true
      controller.abort()

      return true
    }

    const { status } = response

    const json = await response.json()

    const {
      error_description: errorDescription = '',
      resolution_url: resolutionUrl
    } = json

    if (status === 403 && errorDescription.toLowerCase().includes('eula')) {
      await database.updateDownloadById(downloadId, {
        state: downloadStates.waitingForEula,
        eulaUrl: resolutionUrl
      })

      await sendToEula({
        database,
        downloadsWaitingForEula,
        info: {
          downloadId,
          fileId
        },
        webContents
      })
    }
  } catch (error) {
    let message = 'This file could not be downloaded'

    if (response) {
      const {
        status,
        statusText
      } = response

      message = `HTTP Error Response: ${status} ${statusText}`
    }

    await database.updateFileById(fileId, {
      state: downloadStates.error,
      errors: message
    })
  }

  return false
}

export default verifyDownload
