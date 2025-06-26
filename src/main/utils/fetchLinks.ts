// @ts-nocheck

import { net } from 'electron'
import Ajv from 'ajv'

import initializeDownload from './initializeDownload'

import downloadStates from '../../app/constants/downloadStates'

import getLinksSchema from '../getLinksSchema.json'
import isTrustedLink from './isTrustedLink'

import packageDetails from '../../../package.json'
import metricsEvent from '../../app/constants/metricsEvent'
import metricsLogger from './metricsLogger'

const ajv = new Ajv()

/**
 * Fetches links for the given downloadId, adds links to the database.
 * @param {Object} params
 * @param {Object} params.appWindow Electron window instance
 * @param {Object} params.database `EddDatabase` instance
 * @param {Object} params.downloadId Download ID to add links to
 * @param {String} params.getLinks URL used to fetch links
 * @param {String} params.token Token for use when fetching links
 */
const fetchLinks = async ({
  appWindow,
  database,
  downloadId,
  getLinksToken,
  getLinksUrl
}) => {
  // Create a download in the database
  await database.updateDownloadById(downloadId, {
    loadingMoreFiles: true,
    state: downloadStates.starting
  })

  // If the getLinks URL is not trusted, don't fetch the links
  if (!isTrustedLink(getLinksUrl)) {
    const message = `The host [${getLinksUrl}] is not a trusted source and Earthdata Download will not continue.\nIf you wish to have this link included in the list of trusted sources please contact us at ${packageDetails.author.email} or submit a Pull Request at ${packageDetails.homepage}.`

    console.log(message)

    metricsLogger(database, {
      eventType: metricsEvent.fetchLinksFailed,
      data: {
        downloadId,
        reason: message
      }
    })

    await database.updateDownloadById(downloadId, {
      loadingMoreFiles: false,
      state: downloadStates.errorFetchingLinks,
      errors: JSON.stringify([{
        message
      }])
    })

    return
  }

  let finished = false
  let pageNum = 1
  let cursor

  let response

  let invalidLinks = 0

  try {
    // https://eslint.org/docs/latest/rules/no-await-in-loop#when-not-to-use-it
    /* eslint-disable no-await-in-loop */
    while (!finished) {
      let updatedUrl = getLinksUrl

      // If a cursor exists, add it to the URL
      if (cursor) {
        updatedUrl += `&cursor=${cursor}`
      } else {
        // Add the current pageNum to the URL
        updatedUrl += `&pageNum=${pageNum}`
      }

      const headers = {}

      // If a token exists, add it to the `Authorization` header
      if (getLinksToken) {
        headers.Authorization = getLinksToken
      }

      response = await net.fetch(updatedUrl, {
        headers,
        method: 'GET'
      })

      // eslint-disable-next-line no-await-in-loop
      const jsonResponse = await response.json()

      // If the response is not valid, don't add the links to the database
      const validateGetLinks = ajv.compile(getLinksSchema)
      const valid = validateGetLinks(jsonResponse)

      if (!valid) {
        const validationErrors = validateGetLinks.errors
        const errorMessage = `The response from the getLinks endpoint did not match the expected schema. Error: ${JSON.stringify(validationErrors)}`
        console.log(errorMessage)

        // Log the error to the metrics logger
        metricsLogger(database, {
          eventType: metricsEvent.fetchLinksFailed,
          data: {
            downloadId,
            errorMessage
          }
        })

        await database.updateDownloadById(downloadId, {
          loadingMoreFiles: false,
          state: downloadStates.errorFetchingLinks,
          errors: JSON.stringify([{
            message: errorMessage
          }])
        })

        return
      }

      const {
        cursor: responseCursor,
        done,
        links = []
      } = jsonResponse

      const numberOfLinks = links.length

      // Filter the links to only include https links
      const filteredLinks = links.filter((link) => link.startsWith('https://'))
      invalidLinks += numberOfLinks - filteredLinks.length

      // If no links exist, set `loadingMoreFiles` to false and exit the loop
      if (numberOfLinks === 0) {
        finished = true

        await database.updateDownloadById(downloadId, {
          invalidLinks,
          loadingMoreFiles: false
        })

        return
      }

      // Add the links to the download
      await database.addLinksByDownloadId(downloadId, filteredLinks)

      // If this is the first response back, create a download in the database
      if (pageNum === 1) {
        // Initialize download will let the renderer process know to start a download
        initializeDownload({
          downloadIds: [downloadId],
          database,
          links: filteredLinks,
          webContents: appWindow.webContents
        })
      }

      // If `done` is true, set `loadingMoreFiles` to false
      if (done) {
        await database.updateDownloadById(downloadId, {
          invalidLinks,
          loadingMoreFiles: false
        })
      }

      finished = done
      cursor = responseCursor
      pageNum += 1
    }
    /* eslint-enable no-await-in-loop */
  } catch (error) {
    const reason = `Error while fetching download links: ${error.message}`
    console.log(reason)

    metricsLogger(database, {
      eventType: metricsEvent.fetchLinksFailed,
      data: {
        downloadId,
        reason
      }
    })

    await database.updateDownloadById(downloadId, {
      loadingMoreFiles: false,
      state: downloadStates.errorFetchingLinks,
      errors: JSON.stringify(error)
    })
  }
}

export default fetchLinks
