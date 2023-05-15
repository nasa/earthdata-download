const MockDate = require('mockdate')

const onDone = require('../onDone')
const startNextDownload = require('../startNextDownload')

jest.mock('../startNextDownload')

beforeEach(() => {
  MockDate.set('2023-05-13T22:00:00')
})

describe('onDone', () => {
  test('updates the store and calls startNextDownload for a completed download', () => {
    const currentDownloadItems = {
      removeItem: jest.fn()
    }
    const downloadId = 'mock-download-id'
    const item = {
      getFilename: jest.fn().mockReturnValue('mock-filename.png'),
      getReceivedBytes: jest.fn().mockReturnValue(42),
      getTotalBytes: jest.fn().mockReturnValue(100)
    }
    const state = 'completed'
    const store = {
      get: jest.fn().mockReturnValue({
        // storeItem
        url: 'http://example.com/mock-filename.png',
        state: 'ACTIVE',
        percent: 42,
        timeStart: 1684029600000
      }),
      set: jest.fn()
    }

    onDone({
      currentDownloadItems,
      downloadId,
      downloadIdContext: {},
      item,
      state,
      store,
      webContents: {}
    })

    expect(currentDownloadItems.removeItem).toHaveBeenCalledTimes(1)
    expect(currentDownloadItems.removeItem).toHaveBeenCalledWith('mock-download-id', 'mock-filename.png')

    expect(store.set).toHaveBeenCalledTimes(1)
    expect(store.set).toHaveBeenCalledWith('downloads.mock-download-id.files.mock-filename\\.png', {
      errors: undefined,
      percent: 100,
      state: 'COMPLETED',
      timeEnd: 1684029600000,
      timeStart: 1684029600000,
      url: 'http://example.com/mock-filename.png'
    })

    expect(startNextDownload).toHaveBeenCalledTimes(1)
    expect(startNextDownload).toHaveBeenCalledWith({
      downloadId: 'mock-download-id',
      downloadIdContext: {},
      store,
      wasCancelled: false,
      webContents: {}
    })
  })

  test('updates the store and calls startNextDownload for an interrupted download', () => {
    const currentDownloadItems = {
      removeItem: jest.fn()
    }
    const downloadId = 'mock-download-id'
    const item = {
      getFilename: jest.fn().mockReturnValue('mock-filename.png'),
      getReceivedBytes: jest.fn().mockReturnValue(42),
      getTotalBytes: jest.fn().mockReturnValue(100)
    }
    const state = 'interrupted'
    const store = {
      get: jest.fn().mockReturnValue({
        // storeItem
        url: 'http://example.com/mock-filename.png',
        state: 'ACTIVE',
        percent: 42,
        timeStart: 1684029600000
      }),
      set: jest.fn()
    }

    onDone({
      currentDownloadItems,
      downloadId,
      downloadIdContext: {},
      item,
      state,
      store,
      webContents: {}
    })

    expect(currentDownloadItems.removeItem).toHaveBeenCalledTimes(1)
    expect(currentDownloadItems.removeItem).toHaveBeenCalledWith('mock-download-id', 'mock-filename.png')

    expect(store.set).toHaveBeenCalledTimes(1)
    expect(store.set).toHaveBeenCalledWith('downloads.mock-download-id.files.mock-filename\\.png', {
      errors: undefined,
      percent: 0,
      state: 'ERROR',
      timeEnd: 1684029600000,
      timeStart: 1684029600000,
      url: 'http://example.com/mock-filename.png'
    })

    expect(startNextDownload).toHaveBeenCalledTimes(1)
    expect(startNextDownload).toHaveBeenCalledWith({
      downloadId: 'mock-download-id',
      downloadIdContext: {},
      store,
      wasCancelled: false,
      webContents: {}
    })
  })

  test('updates the store and calls startNextDownload for a cancelled download', () => {
    const currentDownloadItems = {
      removeItem: jest.fn()
    }
    const downloadId = 'mock-download-id'
    const item = {
      getFilename: jest.fn().mockReturnValue('mock-filename.png'),
      getReceivedBytes: jest.fn().mockReturnValue(42),
      getTotalBytes: jest.fn().mockReturnValue(100)
    }
    const state = 'cancelled'
    const store = {
      get: jest.fn().mockReturnValue({
        // storeItem
        url: 'http://example.com/mock-filename.png',
        state: 'ACTIVE',
        percent: 42,
        timeStart: 1684029600000
      }),
      set: jest.fn()
    }

    onDone({
      currentDownloadItems,
      downloadId,
      downloadIdContext: {},
      item,
      state,
      store,
      webContents: {}
    })

    expect(currentDownloadItems.removeItem).toHaveBeenCalledTimes(1)
    expect(currentDownloadItems.removeItem).toHaveBeenCalledWith('mock-download-id', 'mock-filename.png')

    expect(store.set).toHaveBeenCalledTimes(1)
    expect(store.set).toHaveBeenCalledWith('downloads.mock-download-id.files.mock-filename\\.png', {
      errors: undefined,
      percent: 0,
      state: 'PENDING',
      timeEnd: 1684029600000,
      timeStart: 1684029600000,
      url: 'http://example.com/mock-filename.png'
    })

    expect(startNextDownload).toHaveBeenCalledTimes(1)
    expect(startNextDownload).toHaveBeenCalledWith({
      downloadId: 'mock-download-id',
      downloadIdContext: {},
      store,
      wasCancelled: true,
      webContents: {}
    })
  })
})
