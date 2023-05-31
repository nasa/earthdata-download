import MockDate from 'mockdate'

import beginDownload from '../beginDownload'
import CurrentDownloadItems from '../../utils/currentDownloadItems'

beforeEach(() => {
  MockDate.set('2023-05-01')
})

describe('beginDownload', () => {
  test('updates the store with the new information', () => {
    const downloadIdContext = {}
    const info = {
      downloadIds: ['mock-id'],
      downloadLocation: '/mock/location',
      makeDefaultDownloadLocation: false
    }
    const store = {
      set: jest.fn(),
      get: jest.fn().mockReturnValue({
        concurrentDownloads: 5
      })
    }
    const webContents = {
      downloadURL: jest.fn()
    }
    const pendingDownloads = {
      'mock-id': {
        files: [
          {
            url: 'mock-url'
          }
        ]
      }
    }

    beginDownload({
      downloadIdContext,
      currentDownloadItems: new CurrentDownloadItems(),
      info,
      store,
      webContents,
      pendingDownloads
    })

    expect(store.get).toHaveBeenCalledTimes(1)
    expect(store.set).toHaveBeenCalledTimes(2)
    expect(store.set).toHaveBeenCalledWith('preferences', {
      defaultDownloadLocation: undefined,
      lastDownloadLocation: '/mock/location',
      concurrentDownloads: 5
    })
    expect(store.set).toHaveBeenCalledWith('downloads.mock-id', {
      downloadLocation: '/mock/location/mock-id',
      timeStart: 1682899200000,
      files: {
        'mock-url': {
          name: undefined,
          percent: 0,
          state: 'ACTIVE',
          url: 'mock-url'
        }
      },
      state: 'ACTIVE'
    })

    expect(downloadIdContext).toEqual({ 'mock-url': 'mock-id' })
    expect(webContents.downloadURL).toHaveBeenCalledTimes(1)
    expect(webContents.downloadURL).toHaveBeenCalledWith('mock-url')
  })

  test('updates the store with defaultDownloadLocation', () => {
    const downloadIdContext = {}
    const info = {
      downloadIds: ['mock-id'],
      downloadLocation: '/mock/location',
      makeDefaultDownloadLocation: true
    }
    const store = {
      set: jest.fn(),
      get: jest.fn().mockReturnValue({
        concurrentDownloads: 5
      })
    }
    const webContents = {
      downloadURL: jest.fn()
    }
    const pendingDownloads = {
      'mock-id': {
        files: [
          {
            url: 'mock-url'
          }
        ]
      }
    }

    beginDownload({
      downloadIdContext,
      currentDownloadItems: new CurrentDownloadItems(),
      info,
      store,
      webContents,
      pendingDownloads
    })

    expect(store.get).toHaveBeenCalledTimes(1)
    expect(store.set).toHaveBeenCalledTimes(2)
    expect(store.set).toHaveBeenCalledWith('preferences', {
      defaultDownloadLocation: '/mock/location',
      lastDownloadLocation: '/mock/location',
      concurrentDownloads: 5
    })
    expect(store.set).toHaveBeenCalledWith('downloads.mock-id', {
      downloadLocation: '/mock/location/mock-id',
      timeStart: 1682899200000,
      files: {
        'mock-url': {
          name: undefined,
          percent: 0,
          state: 'ACTIVE',
          url: 'mock-url'
        }
      },
      state: 'ACTIVE'
    })

    expect(downloadIdContext).toEqual({ 'mock-url': 'mock-id' })
    expect(webContents.downloadURL).toHaveBeenCalledTimes(1)
    expect(webContents.downloadURL).toHaveBeenCalledWith('mock-url')
  })

  test('sets files to pending if they exceed the concurrentDownloads limit', () => {
    const downloadIdContext = {}
    const info = {
      downloadIds: ['mock-id'],
      downloadLocation: '/mock/location',
      makeDefaultDownloadLocation: false
    }
    const store = {
      set: jest.fn(),
      get: jest.fn().mockReturnValue({
        concurrentDownloads: 1
      })
    }
    const webContents = {
      downloadURL: jest.fn()
    }
    const pendingDownloads = {
      'mock-id': {
        files: [
          {
            url: 'mock-url-1'
          },
          {
            url: 'mock-url-2'
          }
        ]
      }
    }

    beginDownload({
      downloadIdContext,
      currentDownloadItems: new CurrentDownloadItems(),
      info,
      store,
      webContents,
      pendingDownloads
    })

    expect(store.get).toHaveBeenCalledTimes(1)
    expect(store.set).toHaveBeenCalledTimes(2)
    expect(store.set).toHaveBeenCalledWith('preferences', {
      defaultDownloadLocation: undefined,
      lastDownloadLocation: '/mock/location',
      concurrentDownloads: 1
    })
    expect(store.set).toHaveBeenCalledWith('downloads.mock-id', {
      downloadLocation: '/mock/location/mock-id',
      timeStart: 1682899200000,
      files: {
        'mock-url-1': {
          name: undefined,
          percent: 0,
          state: 'ACTIVE',
          url: 'mock-url-1'
        },
        'mock-url-2': {
          name: undefined,
          percent: 0,
          state: 'PENDING',
          url: 'mock-url-2'
        }
      },
      state: 'ACTIVE'
    })

    expect(downloadIdContext).toEqual({ 'mock-url-1': 'mock-id' })
    expect(webContents.downloadURL).toHaveBeenCalledTimes(1)
    expect(webContents.downloadURL).toHaveBeenCalledWith('mock-url-1')
  })
})
