import MockDate from 'mockdate'

import startNextDownload from '../startNextDownload'
import CurrentDownloadItems from '../../../utils/currentDownloadItems'

beforeEach(() => {
  MockDate.set('2023-05-13T22:00:00')
})

describe('startNextDownload', () => {
  test('starts downloading the next file in the same download', () => {
    const downloadId = 'mock-download-id'
    const downloadIdContext = {}
    const store = {
      get: jest.fn()
        .mockReturnValueOnce(2)
        .mockReturnValueOnce({
          // allDownloads
          [downloadId]: {
            files: {
              'mock-filename-1.png': {
                url: 'http://example.com/mock-filename-1.png',
                state: 'COMPLETED',
                percent: 100
              },
              'mock-filename-2.png': {
                url: 'http://example.com/mock-filename-2.png',
                state: 'COMPLETED',
                percent: 100
              },
              'mock-filename-3.png': {
                url: 'http://example.com/mock-filename-3.png',
                state: 'PENDING',
                percent: 0
              }
            },
            state: 'ACTIVE'
          }
        })
        .mockReturnValueOnce({
          // allDownloads
          [downloadId]: {
            files: {
              'mock-filename-1.png': {
                url: 'http://example.com/mock-filename-1.png',
                state: 'COMPLETED',
                percent: 100
              },
              'mock-filename-2.png': {
                url: 'http://example.com/mock-filename-2.png',
                state: 'COMPLETED',
                percent: 100
              },
              'mock-filename-3.png': {
                url: 'http://example.com/mock-filename-3.png',
                state: 'ACTIVE',
                percent: 0
              }
            },
            state: 'ACTIVE'
          }
        }),
      set: jest.fn()
    }
    const webContents = {
      downloadURL: jest.fn()
    }
    const currentDownloadItems = new CurrentDownloadItems()

    startNextDownload({
      currentDownloadItems,
      downloadId,
      downloadIdContext,
      store,
      webContents
    })

    expect(store.get).toHaveBeenCalledTimes(3)
    expect(store.get).toHaveBeenCalledWith('preferences.concurrentDownloads')
    expect(store.get).toHaveBeenCalledWith('downloads')

    expect(store.set).toHaveBeenCalledTimes(1)
    expect(store.set).toHaveBeenCalledWith('downloads.mock-download-id.files.mock-filename-3\\.png.state', 'ACTIVE')

    expect(webContents.downloadURL).toHaveBeenCalledTimes(1)
    expect(webContents.downloadURL).toHaveBeenCalledWith('http://example.com/mock-filename-3.png')

    expect(downloadIdContext).toEqual({
      'http://example.com/mock-filename-3.png': 'mock-download-id'
    })
  })

  test('sets the timeEnd on the download if all the files are completed', () => {
    const downloadId = 'mock-download-id'
    const downloadIdContext = {}
    const store = {
      get: jest.fn()
        .mockReturnValueOnce(1)
        .mockReturnValueOnce({
          // allDownloads
          [downloadId]: {
            files: {
              'mock-filename-1.png': {
                url: 'http://example.com/mock-filename-1.png',
                state: 'COMPLETED',
                percent: 100
              },
              'mock-filename-2.png': {
                url: 'http://example.com/mock-filename-2.png',
                state: 'COMPLETED',
                percent: 100
              },
              'mock-filename-3.png': {
                url: 'http://example.com/mock-filename-3.png',
                state: 'COMPLETED',
                percent: 100
              }
            },
            state: 'ACTIVE'
          }
        })
        .mockReturnValueOnce({
          files: {
            'mock-filename-1.png': {
              url: 'http://example.com/mock-filename-1.png',
              state: 'COMPLETED',
              percent: 100
            },
            'mock-filename-2.png': {
              url: 'http://example.com/mock-filename-2.png',
              state: 'COMPLETED',
              percent: 100
            },
            'mock-filename-3.png': {
              url: 'http://example.com/mock-filename-3.png',
              state: 'COMPLETED',
              percent: 100
            }
          },
          state: 'ACTIVE'
        }),
      set: jest.fn()
    }
    const webContents = {
      downloadURL: jest.fn()
    }
    const currentDownloadItems = new CurrentDownloadItems()

    startNextDownload({
      currentDownloadItems,
      downloadId,
      downloadIdContext,
      store,
      webContents
    })

    expect(store.get).toHaveBeenCalledTimes(3)
    expect(store.get).toHaveBeenCalledWith('preferences.concurrentDownloads')
    expect(store.get).toHaveBeenCalledWith('downloads')
    expect(store.get).toHaveBeenCalledWith('downloads.mock-download-id')

    expect(store.set).toHaveBeenCalledTimes(1)
    expect(store.set).toHaveBeenCalledWith('downloads.mock-download-id', {
      files: {
        'mock-filename-1.png': {
          url: 'http://example.com/mock-filename-1.png',
          state: 'COMPLETED',
          percent: 100
        },
        'mock-filename-2.png': {
          url: 'http://example.com/mock-filename-2.png',
          state: 'COMPLETED',
          percent: 100
        },
        'mock-filename-3.png': {
          url: 'http://example.com/mock-filename-3.png',
          state: 'COMPLETED',
          percent: 100
        }
      },
      state: 'COMPLETED',
      timeEnd: 1684029600000
    })

    expect(webContents.downloadURL).toHaveBeenCalledTimes(0)

    expect(downloadIdContext).toEqual({})
  })

  test('starts downloading the next file in the next active download', () => {
    const downloadId1 = 'mock-download-id1'
    const downloadId2 = 'mock-download-id2'
    const downloadIdContext = {}
    const store = {
      get: jest.fn()
        .mockReturnValueOnce(1)
        .mockReturnValueOnce({
          // allDownloads
          [downloadId1]: {
            files: {
              'mock-filename-1.png': {
                url: 'http://example.com/mock-filename-1.png',
                state: 'COMPLETED',
                percent: 100
              },
              'mock-filename-2.png': {
                url: 'http://example.com/mock-filename-2.png',
                state: 'COMPLETED',
                percent: 100
              },
              'mock-filename-3.png': {
                url: 'http://example.com/mock-filename-3.png',
                state: 'ACTIVE',
                percent: 0
              }
            },
            state: 'ACTIVE'
          },
          [downloadId2]: {
            files: {
              'mock-filename-4.png': {
                url: 'http://example.com/mock-filename-4.png',
                state: 'PENDING',
                percent: 0
              },
              'mock-filename-5.png': {
                url: 'http://example.com/mock-filename-5.png',
                state: 'PENDING',
                percent: 0
              },
              'mock-filename-6.png': {
                url: 'http://example.com/mock-filename-6.png',
                state: 'PENDING',
                percent: 0
              }
            },
            state: 'ACTIVE'
          }
        }),
      //   // allDownloads
      //   [downloadId1]: {
      //     files: {
      //       'mock-filename-1.png': {
      //         url: 'http://example.com/mock-filename-1.png',
      //         state: 'COMPLETED',
      //         percent: 100
      //       },
      //       'mock-filename-2.png': {
      //         url: 'http://example.com/mock-filename-2.png',
      //         state: 'COMPLETED',
      //         percent: 100
      //       },
      //       'mock-filename-3.png': {
      //         url: 'http://example.com/mock-filename-3.png',
      //         state: 'ACTIVE',
      //         percent: 0
      //       }
      //     },
      //     state: 'ACTIVE'
      //   },
      //   [downloadId2]: {
      //     files: {
      //       'mock-filename-4.png': {
      //         url: 'http://example.com/mock-filename-4.png',
      //         state: 'ACTIVE',
      //         percent: 0
      //       },
      //       'mock-filename-5.png': {
      //         url: 'http://example.com/mock-filename-5.png',
      //         state: 'PENDING',
      //         percent: 0
      //       },
      //       'mock-filename-6.png': {
      //         url: 'http://example.com/mock-filename-6.png',
      //         state: 'PENDING',
      //         percent: 0
      //       }
      //     },
      //     state: 'ACTIVE'
      //   }
      // }),
      set: jest.fn()
    }
    const webContents = {
      downloadURL: jest.fn()
    }
    const currentDownloadItems = new CurrentDownloadItems()

    startNextDownload({
      currentDownloadItems,
      downloadId: downloadId1,
      downloadIdContext,
      store,
      webContents
    })

    expect(store.get).toHaveBeenCalledTimes(2)
    expect(store.get).toHaveBeenCalledWith('preferences.concurrentDownloads')
    expect(store.get).toHaveBeenCalledWith('downloads')

    expect(store.set).toHaveBeenCalledTimes(1)
    expect(store.set).toHaveBeenCalledWith('downloads.mock-download-id2.files.mock-filename-4\\.png.state', 'ACTIVE')

    expect(webContents.downloadURL).toHaveBeenCalledTimes(1)
    expect(webContents.downloadURL).toHaveBeenCalledWith('http://example.com/mock-filename-4.png')

    expect(downloadIdContext).toEqual({
      'http://example.com/mock-filename-4.png': 'mock-download-id2'
    })
  })

  test('does not start downloading a file if no more need to be downloading', () => {
    const downloadId = 'mock-download-id'
    const downloadIdContext = {}
    const store = {
      get: jest.fn()
        .mockReturnValueOnce(1)
        .mockReturnValueOnce({
          // allDownloads
          [downloadId]: {
            files: {
              'mock-filename-1.png': {
                url: 'http://example.com/mock-filename-1.png',
                state: 'COMPLETED',
                percent: 100
              },
              'mock-filename-2.png': {
                url: 'http://example.com/mock-filename-2.png',
                state: 'COMPLETED',
                percent: 100
              },
              'mock-filename-3.png': {
                url: 'http://example.com/mock-filename-3.png',
                state: 'COMPLETED',
                percent: 100
              }
            },
            state: 'COMPLETED'
          }
        }),
      set: jest.fn()
    }
    const webContents = {
      downloadURL: jest.fn()
    }
    const currentDownloadItems = new CurrentDownloadItems()

    startNextDownload({
      currentDownloadItems,
      downloadId,
      downloadIdContext,
      store,
      webContents
    })

    expect(store.set).toHaveBeenCalledTimes(0)

    expect(webContents.downloadURL).toHaveBeenCalledTimes(0)

    expect(downloadIdContext).toEqual({})
  })
})
