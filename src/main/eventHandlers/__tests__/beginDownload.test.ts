import MockDate from 'mockdate'

import beginDownload from '../beginDownload'
import CurrentDownloadItems from '../../utils/currentDownloadItems'
import startNextDownload from '../willDownloadEvents/startNextDownload'

jest.mock('../willDownloadEvents/startNextDownload')

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
      get: jest.fn()
        .mockReturnValueOnce({
          concurrentDownloads: 5
        })
        .mockReturnValueOnce({
          files: {
            'mock-url': {
              name: undefined,
              percent: 0,
              state: 'ACTIVE',
              url: 'mock-url'
            }
          },
          state: 'PENDING'
        })
    }
    const webContents = {
      downloadURL: jest.fn()
    }

    beginDownload({
      downloadIdContext,
      currentDownloadItems: new CurrentDownloadItems(),
      info,
      store,
      webContents
    })

    expect(store.get).toHaveBeenCalledTimes(2)
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

    expect(startNextDownload).toHaveBeenCalledTimes(1)
    expect(startNextDownload).toHaveBeenCalledWith(
      expect.objectContaining({
        downloadId: 'mock-id',
        downloadIdContext: {}
      })
    )
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
      get: jest.fn()
        .mockReturnValueOnce({
          concurrentDownloads: 5
        })
        .mockReturnValueOnce({
          files: {
            'mock-url': {
              name: undefined,
              percent: 0,
              state: 'ACTIVE',
              url: 'mock-url'
            }
          },
          state: 'PENDING'
        })
    }
    const webContents = {
      downloadURL: jest.fn()
    }

    beginDownload({
      downloadIdContext,
      currentDownloadItems: new CurrentDownloadItems(),
      info,
      store,
      webContents
    })

    expect(store.get).toHaveBeenCalledTimes(2)
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

    expect(startNextDownload).toHaveBeenCalledTimes(1)
    expect(startNextDownload).toHaveBeenCalledWith(
      expect.objectContaining({
        downloadId: 'mock-id',
        downloadIdContext: {}
      })
    )
  })
})
