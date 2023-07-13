// @ts-nocheck

import fetch from 'node-fetch'

import fetchLinks from '../fetchLinks'
import initializeDownload from '../initializeDownload'

import downloadStates from '../../../app/constants/downloadStates'

jest.spyOn(console, 'error').mockImplementation(() => {})

jest.mock('node-fetch', () => ({
  __esModule: true,
  default: jest.fn()
}))

jest.mock('../initializeDownload', () => ({
  __esModule: true,
  default: jest.fn()
}))

describe('fetchLinks', () => {
  afterEach(() => {
    jest.resetModules()
  })

  test('loads the links and calls initializeDownload', async () => {
    const appWindow = {}
    const downloadId = 'shortName_versionId-20230501_000000'
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
      'http://127.0.0.1:3000/granule_links?id=42&flattenLinks=true&linkTypes=data&pageNum=1',
      {
        headers: {
          Authorization: 'Bearer mock-token'
        },
        method: 'get'
      }
    )
    expect(fetch).toHaveBeenCalledWith(
      'http://127.0.0.1:3000/granule_links?id=42&flattenLinks=true&linkTypes=data&cursor=mock-cursor',
      {
        headers: {
          Authorization: 'Bearer mock-token'
        },
        method: 'get'
      }
    )

    expect(database.updateDownloadById).toHaveBeenCalledTimes(2)
    expect(database.updateDownloadById).toHaveBeenCalledWith(
      'shortName_versionId-20230501_000000',
      {
        loadingMoreFiles: true,
        state: downloadStates.starting
      }
    )
    expect(database.updateDownloadById).toHaveBeenCalledWith(
      'shortName_versionId-20230501_000000',
      {
        loadingMoreFiles: false
      }
    )

    expect(database.addLinksByDownloadId).toHaveBeenCalledTimes(2)
    expect(database.addLinksByDownloadId).toHaveBeenCalledWith(
      'shortName_versionId-20230501_000000',
      ['https://example.com/file1.png']
    )
    expect(database.addLinksByDownloadId).toHaveBeenCalledWith(
      'shortName_versionId-20230501_000000',
      ['https://example.com/file2.png']
    )

    expect(initializeDownload).toHaveBeenCalledTimes(1)
    expect(initializeDownload).toHaveBeenCalledWith(expect.objectContaining({
      downloadIds: ['shortName_versionId-20230501_000000']
    }))
  })

  test('saves the error on error', async () => {
    const appWindow = {}
    const downloadId = 'shortName_versionId-20230501_000000'
    const getLinksUrl = 'http://localhost:3000/granule_links?id=42&flattenLinks=true&linkTypes=data'
    const database = {
      updateDownloadById: jest.fn(),
      addLinksByDownloadId: jest.fn()
    }
    const getLinksToken = 'Bearer mock-token'

    fetch
      .mockImplementationOnce(() => {
        throw new Error(downloadStates.error)
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
      'http://127.0.0.1:3000/granule_links?id=42&flattenLinks=true&linkTypes=data&pageNum=1',
      {
        headers: {
          Authorization: 'Bearer mock-token'
        },
        method: 'get'
      }
    )

    expect(database.updateDownloadById).toHaveBeenCalledTimes(2)
    expect(database.updateDownloadById).toHaveBeenCalledWith(
      'shortName_versionId-20230501_000000',
      {
        loadingMoreFiles: true,
        state: downloadStates.starting
      }
    )
    expect(database.updateDownloadById).toHaveBeenCalledWith(
      'shortName_versionId-20230501_000000',
      {
        errors: '{}',
        loadingMoreFiles: false,
        state: downloadStates.error
      }
    )

    expect(database.addLinksByDownloadId).toHaveBeenCalledTimes(0)

    expect(initializeDownload).toHaveBeenCalledTimes(0)
  })

  test.each([
    'http://malicious:3000/granule_links?id=300&flattenLinks=true&linkTypes=data',
    'http://fakery/granule_links?id=301&flattenLinks=true&linkTypes=data',
    'https://tricksy:3001/granule_links?id=302&flattenLinks=true&linkTypes=data',
    'ftp://sneaky/granule_links?id=304',
    'sftp://fictitious:1234/granule_links?id=305',
    'sftp://fictitious/granule_links?id=306',
    'file:///file:5431/granule_links?id=307',
    '://noprotocol:5431/granule_links?id=308',
    'noprotocol/granule_links?id=309'
  ])('does not download links from untrusted sources: [%s]', async (badLink) => {
    const appWindow = {}
    const downloadId = 'shortName_versionId-20230501_000000'

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

    await fetchLinks({
      appWindow,
      authUrl: '',
      database,
      downloadId,
      getLinksToken,
      getLinksUrl: badLink
    })

    expect(database.updateDownloadById).toHaveBeenCalledTimes(2)
    expect(database.updateDownloadById).toHaveBeenCalledWith(
      'shortName_versionId-20230501_000000',
      {
        loadingMoreFiles: true,
        state: downloadStates.starting
      }
    )
    expect(database.updateDownloadById).toHaveBeenCalledWith(
      'shortName_versionId-20230501_000000',
      {
        errors: [{
          message: `The host [${badLink}] is not a trusted source and Earthdata Downloader will not continue.
If you wish to have this link included in the list of trusted sources please contact us at support@earthdata.nasa.gov or submit a Pull Request at https://github.com/nasa/earthdata-download#readme.`
        }],
        loadingMoreFiles: false,
        state: downloadStates.error
      }
    )

    expect(database.addLinksByDownloadId).toHaveBeenCalledTimes(0)

    // we should not have fetched anything
    expect(fetch).toHaveBeenCalledTimes(0)
  })

  test.each([
    ['bad cursor type', { cursor: 1234, links: ['https://example.com/file1.png'] }],
    ['bad links type', { cursor: 'abc', links: 'https://example.com/file1.png' }],
    ['bad done type', { done: 'yes', cursor: 'abc', links: 'https://example.com/file1.png' }],
    ['missing links', { cursor: 'abc' }],
    ['empty response', '']
  ])('halts on invalid JSON response: %s', async ([, badResponse]) => {
    const appWindow = {}
    const downloadId = 'shortName_versionId-20230501_000000'
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

    expect(database.updateDownloadById).toHaveBeenCalledTimes(2)
    expect(database.updateDownloadById).toHaveBeenCalledWith(
      'shortName_versionId-20230501_000000',
      {
        loadingMoreFiles: true,
        state: downloadStates.starting
      }
    )
    expect(database.updateDownloadById).toHaveBeenCalledWith(
      'shortName_versionId-20230501_000000',
      {
        errors: [{
          message: 'The returned data does not match the expected schema.'
        }],
        loadingMoreFiles: false,
        state: downloadStates.error
      }
    )

    expect(database.addLinksByDownloadId).toHaveBeenCalledTimes(1)
    expect(database.addLinksByDownloadId).toHaveBeenCalledWith(
      'shortName_versionId-20230501_000000',
      ['https://example.com/file1.png']
    )

    expect(fetch).toHaveBeenCalledTimes(2)
  })
})
