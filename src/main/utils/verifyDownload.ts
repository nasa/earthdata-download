// @ts-nocheck

import { net } from 'electron'
import AbortController from 'abort-controller'

import downloadStates from '../../app/constants/downloadStates'
import sendToEula from '../eventHandlers/sendToEula'
import metricsEvent from '../../app/constants/metricsEvent'
import metricsLogger from './metricsLogger'
import sendToLogin from '../eventHandlers/sendToLogin'

/**
 * Verify the download works and log any errors. Also redirects the user to accept a EULA if that is detected.
 * @param {Object} params
 * @param {Object} params.database `EddDatabase` instance
 * @param {String} params.downloadId downloadId of the DownloadItem being downloaded
 * @param {Object} params.downloadsWaitingForAuth Object where we can mark a downloadId as waiting for authentication
 * @param {Object} params.downloadsWaitingForEula Object where we can mark a downloadId as waiting for EULA acceptance
 * @param {Number} params.fileId Optional file ID to start downloading
 * @param {String} params.url URL to verify
 * @param {Object} params.webContents Electron BrowserWindow instance's webContents
 */
const verifyDownload = async ({
  database,
  downloadId,
  downloadsWaitingForAuth,
  downloadsWaitingForEula,
  fileId,
  url,
  webContents
}) => {
  if (downloadsWaitingForAuth[downloadId] || downloadsWaitingForEula[downloadId]) return false

  const { token } = await database.getToken()

  const headers = {}

  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  const controller = new AbortController()

  let response
  try {
    response = await net.fetch(url, {
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

    if (status === 401) {
      console.log(`The download for ${url} had a status code of 401, sending the user to login.`)

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

      return false
    }

    const json = await response.json()

    const {
      error_description: errorDescription = '',
      resolution_url: resolutionUrl
    } = json

    if (status === 403 && errorDescription.toLowerCase().includes('eula')) {
      console.log(`The download for ${url} was redirected to ${resolutionUrl}, sending the user to agree to a EULA. Error description: ${errorDescription}`)

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

    const errorMessage = `Error occured in verifyDownload, message: ${message}`
    console.log(errorMessage)

    metricsLogger(database, {
      eventType: metricsEvent.downloadErrored,
      data: {
        downloadId,
        reason: errorMessage
      }
    })

    await database.updateFileById(fileId, {
      state: downloadStates.error,
      errors: message
    })
  }

  return false
}

export default verifyDownload
