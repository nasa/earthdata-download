// @ts-nocheck

import fetch from 'node-fetch'

import fetchLinks from '../fetchLinks'
import initializeDownload from '../initializeDownload'

import downloadStates from '../../../app/constants/downloadStates'
import metricsEvent from '../../../app/constants/metricsEvent'
import metricsLogger from '../metricsLogger'
import downloadIdForMetrics from '../downloadIdForMetrics'

jest.spyOn(console, 'error').mockImplementation(() => {})

jest.mock('node-fetch', () => ({
  __esModule: true,
  default: jest.fn()
}))

jest.mock('../initializeDownload', () => ({
  __esModule: true,
  default: jest.fn()
}))

jest.mock('../metricsLogger', () => ({
  __esModule: true,
  default: jest.fn()
}))

describe('fetchLinks', () => {
  afterEach(() => {
    jest.resetModules()
  })

  test('loads the links and calls initializeDownload', async () => {
    const appWindow = {}
    const downloadId = 'mock-download-id'
    const getLinksUrl = 'http://localhost:3000/granule_links?id=42&flattenLinks=true&linkTypes=data'
    const database = {
      updateDownloadById: jest.fn(),
      addLinksByDownloadId: jest.fn()
    }
    const getLinksToken = 'Bearer mock-token'

    const page1Response = {
      json: jest.fn().mockReturnValue({
        cursor: 'mock-cursor',
        links: [
          'https://example.com/file1.png'
        ]
      })
    }
    const page2Response = {
      json: jest.fn().mockReturnValue({
        cursor: null,
        links: [
          'https://example.com/file2.png'
        ]
      })
    }
    const page3Response = {
      json: jest.fn().mockReturnValue({
        cursor: null,
        links: []
      })
    }

    fetch
      .mockImplementationOnce(() => page1Response)
      .mockImplementationOnce(() => page2Response)
      .mockImplementationOnce(() => page3Response)

    await fetchLinks({
      appWindow,
      authUrl: '',
      database,
      downloadId,
      getLinksToken,
      getLinksUrl
    })

    expect(fetch).toHaveBeenCalledTimes(3)
    expect(fetch).toHaveBeenCalledWith(
      'http://localhost:3000/granule_links?id=42&flattenLinks=true&linkTypes=data&pageNum=1',
      {
        headers: {
          Authorization: 'Bearer mock-token'
        },
        method: 'get'
      }
    )

    expect(fetch).toHaveBeenCalledWith(
      'http://localhost:3000/granule_links?id=42&flattenLinks=true&linkTypes=data&cursor=mock-cursor',
      {
        headers: {
          Authorization: 'Bearer mock-token'
        },
        method: 'get'
      }
    )

    expect(database.updateDownloadById).toHaveBeenCalledTimes(2)
    expect(database.updateDownloadById).toHaveBeenCalledWith(
      'mock-download-id',
      {
        loadingMoreFiles: true,
        state: downloadStates.starting
      }
    )

    expect(database.updateDownloadById).toHaveBeenCalledWith(
      'mock-download-id',
      {
        loadingMoreFiles: false
      }
    )

    expect(database.addLinksByDownloadId).toHaveBeenCalledTimes(2)
    expect(database.addLinksByDownloadId).toHaveBeenCalledWith(
      'mock-download-id',
      ['https://example.com/file1.png']
    )

    expect(database.addLinksByDownloadId).toHaveBeenCalledWith(
      'mock-download-id',
      ['https://example.com/file2.png']
    )

    expect(initializeDownload).toHaveBeenCalledTimes(1)
    expect(initializeDownload).toHaveBeenCalledWith(expect.objectContaining({
      downloadIds: ['mock-download-id']
    }))
  })

  test('loads the links and calls initializeDownload when done is true', async () => {
    const appWindow = {}
    const downloadId = 'mock-download-id'
    const getLinksUrl = 'http://localhost:3000/granule_links?id=42&flattenLinks=true&linkTypes=data'
    const database = {
      updateDownloadById: jest.fn(),
      addLinksByDownloadId: jest.fn()
    }
    const getLinksToken = 'Bearer mock-token'

    const page1Response = {
      json: jest.fn().mockReturnValue({
        done: true,
        links: [
          'https://example.com/file1.png'
        ]
      })
    }

    fetch
      .mockImplementationOnce(() => page1Response)

    await fetchLinks({
      appWindow,
      authUrl: '',
      database,
      downloadId,
      getLinksToken,
      getLinksUrl
    })

    expect(fetch).toHaveBeenCalledTimes(1)
    expect(fetch).toHaveBeenCalledWith(
      'http://localhost:3000/granule_links?id=42&flattenLinks=true&linkTypes=data&pageNum=1',
      {
        headers: {
          Authorization: 'Bearer mock-token'
        },
        method: 'get'
      }
    )

    expect(database.updateDownloadById).toHaveBeenCalledTimes(2)
    expect(database.updateDownloadById).toHaveBeenCalledWith(
      'mock-download-id',
      {
        loadingMoreFiles: true,
        state: downloadStates.starting
      }
    )

    expect(database.updateDownloadById).toHaveBeenCalledWith(
      'mock-download-id',
      {
        loadingMoreFiles: false
      }
    )

    expect(database.addLinksByDownloadId).toHaveBeenCalledTimes(1)
    expect(database.addLinksByDownloadId).toHaveBeenCalledWith(
      'mock-download-id',
      ['https://example.com/file1.png']
    )

    expect(initializeDownload).toHaveBeenCalledTimes(1)
    expect(initializeDownload).toHaveBeenCalledWith(expect.objectContaining({
      downloadIds: ['mock-download-id']
    }))
  })

  test('saves the error on error', async () => {
    const appWindow = {}
    const downloadId = 'mock-download-id'
    const getLinksUrl = 'http://localhost:3000/granule_links?id=42&flattenLinks=true&linkTypes=data'
    const database = {
      updateDownloadById: jest.fn(),
      addLinksByDownloadId: jest.fn()
    }
    const getLinksToken = 'Bearer mock-token'
    const error = new Error(downloadStates.error)

    fetch
      .mockImplementationOnce(() => {
        throw error
      })

    await fetchLinks({
      appWindow,
      authUrl: '',
      database,
      downloadId,
      getLinksToken,
      getLinksUrl
    })

    expect(fetch).toHaveBeenCalledTimes(1)
    expect(fetch).toHaveBeenCalledWith(
      'http://localhost:3000/granule_links?id=42&flattenLinks=true&linkTypes=data&pageNum=1',
      {
        headers: {
          Authorization: 'Bearer mock-token'
        },
        method: 'get'
      }
    )

    expect(metricsLogger).toHaveBeenCalledTimes(1)
    expect(metricsLogger).toHaveBeenCalledWith(database, {
      eventType: metricsEvent.downloadLinksFailed,
      data: {
        downloadId: downloadIdForMetrics(downloadId),
        reason: `Error while fetching download links: ${error.message}`
      }
    })

    expect(database.updateDownloadById).toHaveBeenCalledTimes(2)
    expect(database.updateDownloadById).toHaveBeenCalledWith(
      'mock-download-id',
      {
        loadingMoreFiles: true,
        state: downloadStates.starting
      }
    )

    expect(database.updateDownloadById).toHaveBeenCalledWith(
      'mock-download-id',
      {
        errors: '{}',
        loadingMoreFiles: false,
        state: downloadStates.errorFetchingLinks
      }
    )

    expect(database.addLinksByDownloadId).toHaveBeenCalledTimes(0)

    expect(initializeDownload).toHaveBeenCalledTimes(0)
  })

  test('does not download links from an untrusted source', async () => {
    const appWindow = {}
    const downloadId = 'mock-download-id'

    const database = {
      updateDownloadById: jest.fn(),
      addLinksByDownloadId: jest.fn()
    }

    const getLinksToken = 'Bearer mock-token'

    const standardResponse = {
      json: jest.fn().mockReturnValue({
        cursor: 'mock-cursor',
        links: ['https://example.com/file1.png']
      })
    }
    fetch.mockImplementation(() => standardResponse)
    const getLinksUrl = 'http://fakery/granule_links?id=301&flattenLinks=true&linkTypes=data'
    const reason = `The host [${getLinksUrl}] is not a trusted source and Earthdata Download will not continue.\nIf you wish to have this link included in the list of trusted sources please contact us at support@earthdata.nasa.gov or submit a Pull Request at https://github.com/nasa/earthdata-download#readme.`

    await fetchLinks({
      appWindow,
      authUrl: '',
      database,
      downloadId,
      getLinksToken,
      getLinksUrl
    })

    expect(metricsLogger).toHaveBeenCalledTimes(1)
    expect(metricsLogger).toHaveBeenCalledWith(database, {
      eventType: metricsEvent.downloadLinksFailed,
      data: {
        downloadId: downloadIdForMetrics(downloadId),
        reason
      }
    })

    expect(database.updateDownloadById).toHaveBeenCalledTimes(2)
    expect(database.updateDownloadById).toHaveBeenCalledWith(
      'mock-download-id',
      {
        loadingMoreFiles: true,
        state: downloadStates.starting
      }
    )

    expect(database.updateDownloadById).toHaveBeenCalledWith(
      'mock-download-id',
      {
        errors: [{
          message: reason
        }],
        loadingMoreFiles: false,
        state: downloadStates.error
      }
    )

    expect(database.addLinksByDownloadId).toHaveBeenCalledTimes(0)

    // We should not have fetched anything
    expect(fetch).toHaveBeenCalledTimes(0)
  })

  test.each([
    ['bad cursor type', {
      cursor: 1234,
      links: ['https://example.com/file1.png']
    }],
    ['bad links type', {
      cursor: 'abc',
      links: 'https://example.com/file1.png'
    }],
    ['bad done type', {
      done: 'yes',
      cursor: 'abc',
      links: 'https://example.com/file1.png'
    }],
    ['missing links', { cursor: 'abc' }],
    ['empty response', '']
  ])('halts on invalid JSON response: %s', async ([, badResponse]) => {
    const appWindow = {}
    const downloadId = 'mock-download-id'
    const getLinksUrl = 'http://localhost:3000/granule_links?id=42&flattenLinks=true&linkTypes=data'
    const database = {
      updateDownloadById: jest.fn(),
      addLinksByDownloadId: jest.fn()
    }

    const getLinksToken = ''

    const page1Response = {
      json: jest.fn().mockReturnValue({
        cursor: 'mock-cursor',
        links: ['https://example.com/file1.png']
      })
    }
    const page2Response = {
      json: jest.fn().mockReturnValue(badResponse)
    }
    const page3Response = {
      json: jest.fn().mockReturnValue({
        cursor: null,
        links: []
      })
    }
    const reason = 'The returned data does not match the expected schema.'

    fetch
      .mockImplementationOnce(() => page1Response)
      .mockImplementationOnce(() => page2Response)
      .mockImplementation(() => page3Response)

    await fetchLinks({
      appWindow,
      authUrl: '',
      database,
      downloadId,
      getLinksToken,
      getLinksUrl
    })

    expect(metricsLogger).toHaveBeenCalledTimes(1)
    expect(metricsLogger).toHaveBeenCalledWith(database, {
      eventType: metricsEvent.downloadLinksFailed,
      data: {
        downloadId: downloadIdForMetrics(downloadId),
        reason
      }
    })

    expect(database.updateDownloadById).toHaveBeenCalledTimes(2)
    expect(database.updateDownloadById).toHaveBeenCalledWith(
      'mock-download-id',
      {
        loadingMoreFiles: true,
        state: downloadStates.starting
      }
    )

    expect(database.updateDownloadById).toHaveBeenCalledWith(
      'mock-download-id',
      {
        errors: [{
          message: reason
        }],
        loadingMoreFiles: false,
        state: downloadStates.error
      }
    )

    expect(database.addLinksByDownloadId).toHaveBeenCalledTimes(1)
    expect(database.addLinksByDownloadId).toHaveBeenCalledWith(
      'mock-download-id',
      ['https://example.com/file1.png']
    )

    expect(fetch).toHaveBeenCalledTimes(2)
  })
})
