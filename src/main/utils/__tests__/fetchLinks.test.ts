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
  test('does not download links from untrusted sources', async () => {
    const appWindow = {}
    const downloadId = 'shortName_versionId'
    const getLinks = 'http://malicious:3000/granule_links?id=300&flattenLinks=true&linkTypes=data'

    const store = {
      set: jest.fn(),
      get: jest.fn()
    }

    const token = 'Bearer mock-token'

    await fetchLinks({
      appWindow,
      downloadId,
      getLinks,
      store,
      token
    })

    const title = store.set.mock.calls[0][0]
    const entry = store.set.mock.calls[0][1]

    expect(title).toEqual('downloads.shortName_versionId-20230501_000000')
    expect(entry).toHaveProperty('loadingMoreFiles', false)
    expect(entry).toHaveProperty('state', 'ERROR')
    expect(entry).toHaveProperty('error')
    expect(entry.error).toMatch(/^the host \[.*\] is not a trusted source.*/i)
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
