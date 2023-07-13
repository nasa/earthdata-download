// @ts-nocheck

import fetch from 'node-fetch'
import Ajv from 'ajv'

import initializeDownload from './initializeDownload'

import downloadStates from '../../app/constants/downloadStates'

import trustedSources from '../trustedSources.json'
import getLinksSchema from '../getLinksSchema.json'
import packageDetails from '../../../package.json'

const ajv = new Ajv()

/**
 * Tests a link against the trustedSources.json file
 * @param {String} link Link to test
 */
const isTrustedLink = (link: string) => {
  const protocolMatch = /^([a-z]*):\/\/\.*/i.exec(link)
  const protocol = protocolMatch?.at(1)?.toLowerCase()

  if (!protocolMatch || (protocol !== 'http' && protocol !== 'https')) {
    return false
  }

  const host = link
    .replace(/^https?:\/\//i, '')
    .split('/')
    .at(0)
    ?.toLowerCase()
    ?.split(':')
    ?.at(0)
  console.debug(`Checking [${host}] for matching trusted host`)
  return host in trustedSources
}

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
    await database.updateDownloadById(downloadId, {
      loadingMoreFiles: false,
      state: downloadStates.error,
      errors: [{
        message: `The host [${getLinksUrl}] is not a trusted source and Earthdata Downloader will not continue.\nIf you wish to have this link included in the list of trusted sources please contact us at ${packageDetails.author.email} or submit a Pull Request at ${packageDetails.homepage}.`
      }]
    })

    return
  }

  let finished = false
  let pageNum = 1
  let cursor

  let response

  try {
    // https://eslint.org/docs/latest/rules/no-await-in-loop#when-not-to-use-it
    /* eslint-disable no-await-in-loop */
    while (!finished) {
      // node-fetch doesn't play nice with `localhost`, replace it with 127.0.0.1 for local dev
      let updatedUrl = getLinksUrl.replace('localhost', '127.0.0.1')

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

      // eslint-disable-next-line no-await-in-loop
      response = await fetch(updatedUrl, {
        headers,
        method: 'get'
      })

      // eslint-disable-next-line no-await-in-loop
      const jsonResponse = await response.json()

      // If the response is not valid, don't add the links to the database
      const validateGetLinks = ajv.compile(getLinksSchema)
      const valid = validateGetLinks(jsonResponse)
      if (!valid) {
        await database.updateDownloadById(downloadId, {
          loadingMoreFiles: false,
          state: downloadStates.error,
          errors: [{
            message: 'The returned data does not match the expected schema.'
          }]
        })

        console.error(validateGetLinks.errors)

        return
      }

      const { cursor: responseCursor, done, links = [] } = jsonResponse

      // If no links exist, set `loadingMoreFiles` to false and exit the loop
      if (links.length === 0) {
        finished = true

        await database.updateDownloadById(downloadId, {
          loadingMoreFiles: false
        })

        return
      }

      // Add the links to the download
      await database.addLinksByDownloadId(downloadId, links)

      // If this is the first response back, create a download in the database
      if (pageNum === 1) {
        // Initialize download will let the renderer process know to start a download
        initializeDownload({
          downloadIds: [downloadId],
          database,
          webContents: appWindow.webContents
        })
      }

      finished = done
      cursor = responseCursor
      pageNum += 1
    }
    /* eslint-enable no-await-in-loop */
  } catch (error) {
    await database.updateDownloadById(downloadId, {
      loadingMoreFiles: false,
      state: downloadStates.error,
      errors: JSON.stringify(error)
    })
  }
}

export default fetchLinks
