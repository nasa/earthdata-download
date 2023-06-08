// @ts-nocheck

import fetch from 'node-fetch'

import formatLinks from './formatLinks'
import initializeDownload from './initializeDownload'

import downloadStates from '../../app/constants/downloadStates'

// import beginDownload from '../eventHandlers/beginDownload'

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

/**
 * Fetches links for the given downloadId, adds links to the store.
 * @param {Object} params
 * @param {Object} params.downloadId Download ID to add links to
 * @param {String} params.getLinks URL used to fetch links
 * @param {Object} params.store `electron-store` instance
 * @param {String} params.token Token for use when fetching links
 * @param {Object} params.appWindow Electron window instance
 */
const fetchLinks = async ({
  downloadId,
  getLinks,
  store,
  token,
  appWindow
}) => {
  // TODO add docs file(s) for this request/response format
  // Fetch the first page of links from `url`

  // If the response contains a `cursor`, append it to the URL parameters and keep requesting until no items come back
  // If the response does not contain a `cursor` increment the pageNum parameter and keep requesting until no items come back

  const now = new Date()
    .toISOString()
    .replace(/(:|-)/g, '')
    .replace('T', '_')
    .split('.')[0]

  const downloadIdWithTime = `${downloadId.replaceAll('.', '\\.')}-${now}`

  let finished = false
  let pageNum = 1
  let cursor

  let response

  try {
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

      const {
        cursor: responseCursor,
        links = []
      } = jsonResponse

      // If no links exist, set `loadingMoreFiles` to false and exit the loop
      if (links.length === 0) {
        finished = true
        store.set(`downloads.${downloadIdWithTime}.loadingMoreFiles`, false)
        return
      }

      // If this is the first response back, create a download in the store
      if (pageNum === 1) {
        // Create a download in the store with the first page of links
        store.set(`downloads.${downloadIdWithTime}`, {
          state: downloadStates.pending,
          loadingMoreFiles: true,
          files: formatLinks(links)
        })

        // Initialize download will let the renderer process know to start a download
        initializeDownload({
          appWindow,
          downloadIds: [downloadIdWithTime],
          store
        })
      } else {
        // Append more links to the existing links in the store
        const currentFiles = store.get(`downloads.${downloadIdWithTime}.files`)

        store.set(`downloads.${downloadIdWithTime}.files`, {
          ...currentFiles,
          ...formatLinks(links)
        })
      }

      cursor = responseCursor
      pageNum += 1
    }
  } catch (error) {
    // TODO what do we need to do here?
    console.log('🚀 ~ file: fetchLinks.ts:43 ~ fetchLinks ~ error:', error)
  }
}

export default fetchLinks
