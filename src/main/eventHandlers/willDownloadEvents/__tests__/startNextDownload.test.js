const MockDate = require('mockdate')

const startNextDownload = require('../startNextDownload')

beforeEach(() => {
  MockDate.set('2023-05-13T22:00:00')
})

describe('startNextDownload', () => {
  test('starts downloading the next file in the same download', () => {
    const downloadId = 'mock-download-id'
    const downloadIdContext = {}
    const store = {
      get: jest.fn()
        .mockReturnValueOnce({
          'mock-filename-1.png': {
            url: 'http://example.com/mock-filename-1.png',
            state: 'COMPLETED',
            percent: 100
          },
          'mock-filename-2.png': {
            url: 'http://example.com/mock-filename-2.png',
            state: 'ACTIVE',
            percent: 39
          },
          'mock-filename-3.png': {
            url: 'http://example.com/mock-filename-3.png',
            state: 'PENDING',
            percent: 0
          }
        }),
      set: jest.fn()
    }
    const webContents = {
      downloadURL: jest.fn()
    }

    startNextDownload({
      downloadId,
      downloadIdContext,
      store,
      wasCancelled: false,
      webContents
    })

    expect(store.set).toHaveBeenCalledTimes(0)

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
        .mockReturnValueOnce({
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
        })
        .mockReturnValueOnce({
          // storeDownload
          files: {
            'mock-filename-1.png': {
              url: 'http://example.com/mock-filename-1.png',
              state: 'COMPLETED',
              percent: 100
            },
            'mock-filename-2.png': {
              url: 'http://example.com/mock-filename-2.png',
              state: 'ACTIVE',
              percent: 39
            },
            'mock-filename-3.png': {
              url: 'http://example.com/mock-filename-3.png',
              state: 'ACTIVE',
              percent: 0
            }
          },
          state: 'ACTIVE'
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
                state: 'ACTIVE',
                percent: 39
              },
              'mock-filename-3.png': {
                url: 'http://example.com/mock-filename-3.png',
                state: 'ACTIVE',
                percent: 0
              }
            }
          },
          state: 'ACTIVE'
        }),
      set: jest.fn()
    }
    const webContents = {
      downloadURL: jest.fn()
    }

    startNextDownload({
      downloadId,
      downloadIdContext,
      store,
      wasCancelled: false,
      webContents
    })

    expect(store.set).toHaveBeenCalledTimes(1)
    expect(store.set).toHaveBeenCalledWith('downloads.mock-download-id', {

      files: {
        'mock-filename-1.png': {
          percent: 100,
          state: 'COMPLETED',
          url: 'http://example.com/mock-filename-1.png'
        },
        'mock-filename-2.png': {
          percent: 39,
          state: 'ACTIVE',
          url: 'http://example.com/mock-filename-2.png'
        },
        'mock-filename-3.png': {
          percent: 0,
          state: 'ACTIVE',
          url: 'http://example.com/mock-filename-3.png'
        }
      },
      state: 'COMPLETED',
      timeEnd: 1684029600000
    })

    expect(webContents.downloadURL).toHaveBeenCalledTimes(0)

    expect(downloadIdContext).toEqual({})
  })

  test.only('starts downloading the next file in the next active download', () => {
    const downloadId = 'mock-download-id'
    const downloadIdContext = {}
    const store = {
      get: jest.fn()
        .mockReturnValueOnce({
          // allFiles
          'mock-filename-1.png': {
            url: 'http://example.com/mock-filename-1.png',
            state: 'COMPLETED',
            percent: 100
          },
          'mock-filename-2.png': {
            url: 'http://example.com/mock-filename-2.png',
            state: 'ACTIVE',
            percent: 39
          },
          'mock-filename-3.png': {
            url: 'http://example.com/mock-filename-3.png',
            state: 'ACTIVE',
            percent: 0
          }
        })
        .mockReturnValueOnce({
          // storeDownload
          'mock-filename-1.png': {
            url: 'http://example.com/mock-filename-1.png',
            state: 'COMPLETED',
            percent: 100
          },
          'mock-filename-2.png': {
            url: 'http://example.com/mock-filename-2.png',
            state: 'ACTIVE',
            percent: 39
          },
          'mock-filename-3.png': {
            url: 'http://example.com/mock-filename-3.png',
            state: 'ACTIVE',
            percent: 0
          }
        }),
      set: jest.fn()
    }
    const webContents = {
      downloadURL: jest.fn()
    }

    startNextDownload({
      downloadId,
      downloadIdContext,
      store,
      wasCancelled: false,
      webContents
    })

    expect(store.set).toHaveBeenCalledTimes(0)

    expect(webContents.downloadURL).toHaveBeenCalledTimes(1)
    expect(webContents.downloadURL).toHaveBeenCalledWith('http://example.com/mock-filename-4.png')

    expect(downloadIdContext).toEqual({
      'http://example.com/mock-filename-4.png': 'mock-download-id-2'
    })
  })

  test('does not start downloading a file if no more need to be downloading', () => {})

  test('starts multiple files if necessary from a cancelled download', () => {})
})
