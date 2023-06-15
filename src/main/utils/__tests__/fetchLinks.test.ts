// @ts-nocheck

import MockDate from 'mockdate'
import fetch from 'node-fetch'

import fetchLinks from '../fetchLinks'
import initializeDownload from '../initializeDownload'

jest.mock('node-fetch', () => ({
  __esModule: true,
  default: jest.fn()
}))

jest.mock('../initializeDownload', () => ({
  __esModule: true,
  default: jest.fn()
}))

beforeEach(() => {
  MockDate.set('2023-05-01')
})

describe('fetchLinks', () => {
  afterEach(() => {
    jest.resetModules()
  })

  test.each(
    [
      'http://malicious:3000/granule_links?id=300&flattenLinks=true&linkTypes=data',
      'http://fakery/granule_links?id=301&flattenLinks=true&linkTypes=data',
      'https://tricksy:3001/granule_links?id=302&flattenLinks=true&linkTypes=data',
      'ftp://sneaky/granule_links?id=304',
      'sftp://fictitious:1234/granule_links?id=305',
      'sftp://fictitious/granule_links?id=306',
      'file:///noprotocol:5431/granule_links?id=307',
      '://noprotocol:5431/granule_links?id=308',
      'noprotocol/granule_links?id=309'
    ]
  )('does not download links from untrusted sources: [%s]', async (badLink) => {
    const appWindow = {}
    const downloadId = 'shortName_versionId'

    const store = {
      set: jest.fn(),
      get: jest.fn()
    }

    const token = 'Bearer mock-token'

    await fetchLinks({
      appWindow,
      downloadId,
      getLinks: badLink,
      store,
      token
    })

    const [[title, entry]] = store.set.mock.calls

    expect(title).toEqual('downloads.shortName_versionId-20230501_000000')
    expect(entry).toHaveProperty('loadingMoreFiles', false)
    expect(entry).toHaveProperty('state', 'ERROR')
    expect(entry).toHaveProperty('error')
    expect(entry.error).toMatch(/^the host \[.*\] is not a trusted source.*/i)
  })

  test.each([
    ['bad cursor type', { cursor: 1234, links: ['https://example.com/file1.png'] }],
    ['bad links type', { cursor: 'abc', links: 'https://example.com/file1.png' }],
    ['bad done type', { done: 'yes', cursor: 'abc', links: 'https://example.com/file1.png' }],
    ['missing links', { cursor: 'abc' }],
    ['empty response', '']])('halts on invalid JSON response: %s', async ([, badLink]) => {
    const appWindow = {}
    const downloadId = 'shortName_versionId'
    const getLinks = 'http://localhost:3000/granule_links?id=42&flattenLinks=true&linkTypes=data'
    const store = {
      set: jest.fn(),
      get: jest.fn()
    }

    const token = 'Bearer mock-token'

    const page1Response = {
      json: jest.fn().mockReturnValue({
        cursor: 'mock-cursor',
        links: ['https://example.com/file1.png']
      })
    }
    const page2Response = {
      json: jest.fn().mockReturnValue(badLink)
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
      downloadId,
      getLinks,
      store,
      token
    })

    const [, , [title, entry]] = store.set.mock.calls

    expect(title).toEqual('downloads.shortName_versionId-20230501_000000')
    expect(entry).toHaveProperty('loadingMoreFiles', false)
    expect(entry).toHaveProperty('state', 'ERROR')
    expect(entry).toHaveProperty('error', 'The returned data does not match the expected schema.')

    expect(fetch).toHaveBeenCalledTimes(2)
  })

  test('loads the links and calls initializeDownload', async () => {
    const appWindow = {}
    const downloadId = 'shortName_versionId'
    const getLinks = 'http://localhost:3000/granule_links?id=42&flattenLinks=true&linkTypes=data'
    const store = {
      set: jest.fn(),
      get: jest.fn().mockReturnValueOnce({
        'file1.png': {
          percent: 0,
          state: 'PENDING',
          url: 'https://example.com/file1.png'
        }
      })
    }
    const token = 'Bearer mock-token'

    const page1Response = {
      json: jest.fn().mockReturnValue({
        cursor: 'mock-cursor',
        links: ['https://example.com/file1.png']
      })
    }
    const page2Response = {
      json: jest.fn().mockReturnValue({
        cursor: null,
        links: ['https://example.com/file2.png']
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
      downloadId,
      getLinks,
      store,
      token
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

    expect(initializeDownload).toHaveBeenCalledTimes(1)
    expect(initializeDownload).toHaveBeenCalledWith(
      expect.objectContaining({
        downloadIds: ['shortName_versionId-20230501_000000']
      })
    )

    expect(store.set).toHaveBeenCalledTimes(4)
    expect(store.set).toHaveBeenCalledWith(
      'downloads.shortName_versionId-20230501_000000',
      {
        loadingMoreFiles: true,
        state: 'PENDING'
      }
    )
    expect(store.set).toHaveBeenCalledWith(
      'downloads.shortName_versionId-20230501_000000.files',
      {
        'file1.png': {
          percent: 0,
          state: 'PENDING',
          url: 'https://example.com/file1.png'
        }
      }
    )
    expect(store.set).toHaveBeenCalledWith(
      'downloads.shortName_versionId-20230501_000000.files',
      {
        'file1.png': {
          percent: 0,
          state: 'PENDING',
          url: 'https://example.com/file1.png'
        },
        'file2.png': {
          percent: 0,
          state: 'PENDING',
          url: 'https://example.com/file2.png'
        }
      }
    )
    expect(store.set).toHaveBeenCalledWith(
      'downloads.shortName_versionId-20230501_000000.loadingMoreFiles',
      false
    )
  })

  test('saves the error on error', async () => {
    const appWindow = {}
    const downloadId = 'shortName_versionId'
    const getLinks = 'http://localhost:3000/granule_links?id=42&flattenLinks=true&linkTypes=data'
    const store = {
      set: jest.fn(),
      get: jest.fn().mockReturnValueOnce({
        loadingMoreFiles: true,
        state: 'PENDING',
        files: {
          'file1.png': {
            percent: 0,
            state: 'PENDING',
            url: 'https://example.com/file1.png'
          }
        }
      })
    }
    const token = 'Bearer mock-token'

    fetch.mockImplementationOnce(() => {
      throw new Error('error')
    })

    await fetchLinks({
      appWindow,
      downloadId,
      getLinks,
      store,
      token
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

    expect(initializeDownload).toHaveBeenCalledTimes(0)

    expect(store.get).toHaveBeenCalledTimes(1)
    expect(store.get).toHaveBeenCalledWith(
      'downloads.shortName_versionId-20230501_000000'
    )

    expect(store.set).toHaveBeenCalledTimes(2)
    expect(store.set).toHaveBeenCalledWith(
      'downloads.shortName_versionId-20230501_000000',
      {
        loadingMoreFiles: true,
        state: 'PENDING'
      }
    )
    expect(store.set).toHaveBeenCalledWith(
      'downloads.shortName_versionId-20230501_000000',
      {
        files: {
          'file1.png': {
            percent: 0,
            state: 'PENDING',
            url: 'https://example.com/file1.png'
          }
        },
        loadingMoreFiles: false,
        state: 'ERROR',
        error: 'error'
      }
    )
  })
})
