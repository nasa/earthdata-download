// @ts-nocheck

import fetch from 'node-fetch'
import Ajv from 'ajv'

import initializeDownload from './initializeDownload'

import downloadStates from '../../app/constants/downloadStates'

import trustedSources from '../trustedSources.json'
import getLinksSchema from '../getLinksSchema.json'
import packageDetails from '../../../package.json'

const ajv = new Ajv()

// TODO? find a way to still use test downloads
// const { downloads } = require('../../test-download-files.json')
// const { downloads } = require('../../test-download-files-one-collection.json')
// const { downloads } = require('../../test-download-files-one-file.json')

// const today = new Date()
//   .toISOString()
//   .replace(/(:|-)/g, '')
//   .replace('T', '_')
//   .split('.')[0]

// const pendingDownloads = downloads.reduce((map, download) => ({
//   ...map,
//   [`${download.id}-${today}`]: {
//     ...download
//   }
// }), {})
// console.log('🚀 ~ file: main.ts:59 ~ pendingDownloads ~ pendingDownloads:', pendingDownloads)

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
  downloadId: downloadIdWithoutTime,
  getLinks,
  reAuthUrl,
  token
}) => {
  const now = new Date().toISOString().replace(/(:|-)/g, '').replace('T', '_')
    .split('.')[0]

  const downloadId = `${downloadIdWithoutTime}-${now}`

  // Create a download in the database
  await database.createDownload(downloadId, {
    loadingMoreFiles: true,
    reAuthUrl,
    state: downloadStates.pending,
    createdAt: new Date().getTime()
  })

  // If the getLinks URL is not trusted, don't fetch the links
  if (!isTrustedLink(getLinks)) {
    await database.updateDownloadById(downloadId, {
      loadingMoreFiles: false,
      state: downloadStates.error,
      errors: [{
        message: `The host [${getLinks}] is not a trusted source and Earthdata Downloader will not continue.\nIf you wish to have this link included in the list of trusted sources please contact us at ${packageDetails.author.email} or submit a Pull Request at ${packageDetails.homepage}.`
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
      let updatedUrl = getLinks.replace('localhost', '127.0.0.1')

      // If a cursor exists, add it to the URL
      if (cursor) {
        updatedUrl += `&cursor=${cursor}`
      } else {
        // Add the current pageNum to the URL
        updatedUrl += `&pageNum=${pageNum}`
      }

      const headers = {}

      // If a token exists, add it to the `Authorization` header
      if (token) {
        headers.Authorization = token
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
          appWindow,
          downloadIds: [downloadId],
          database
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
