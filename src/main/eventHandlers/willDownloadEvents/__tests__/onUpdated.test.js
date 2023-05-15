const MockDate = require('mockdate')

const onUpdated = require('../onUpdated')

beforeEach(() => {
  MockDate.set('2023-05-13T22:00:00')
})

describe('onUpdated', () => {
  test('updates the store for interrupted downloads', () => {
    const downloadId = 'mock-download-id'
    const item = {
      getFilename: jest.fn().mockReturnValue('mock-filename.png'),
      getReceivedBytes: jest.fn().mockReturnValue(42),
      getTotalBytes: jest.fn().mockReturnValue(100)
    }
    const state = 'interrupted'
    const store = {
      get: jest.fn()
        .mockReturnValueOnce({
          // storeItem
          url: 'http://example.com/mock-filename.png',
          state: 'ACTIVE',
          percent: 42,
          timeStart: 1684029600000
        })
        .mockReturnValueOnce({
          // storeDownload
          downloadLocation: '',
          timeStart: 1684029600000,
          files: {},
          state: 'ACTIVE'
        }),
      set: jest.fn()
    }

    onUpdated({
      downloadId,
      item,
      state,
      store
    })

    expect(store.set).toHaveBeenCalledTimes(2)
    expect(store.set).toHaveBeenCalledWith('downloads.mock-download-id.files.mock-filename\\.png', {
      percent: 42,
      state: 'INTERRUPTED',
      timeStart: 1684029600000,
      url: 'http://example.com/mock-filename.png'
    })
    expect(store.set).toHaveBeenCalledWith('downloads.mock-download-id', {
      downloadLocation: '',
      files: {},
      state: 'INTERRUPTED',
      timeStart: 1684029600000
    })
  })

  test('updates the store for progressing downloads', () => {
    const downloadId = 'mock-download-id'
    const item = {
      getFilename: jest.fn().mockReturnValue('mock-filename.png'),
      getReceivedBytes: jest.fn().mockReturnValue(42),
      getTotalBytes: jest.fn().mockReturnValue(100),
      isPaused: jest.fn().mockReturnValue(false)
    }
    const state = 'progressing'
    const store = {
      get: jest.fn()
        .mockReturnValueOnce({
          // storeItem
          url: 'http://example.com/mock-filename.png',
          state: 'ACTIVE',
          percent: 42,
          timeStart: 1684029600000
        })
        .mockReturnValueOnce({
          // storeDownload
          downloadLocation: '',
          timeStart: 1684029600000,
          files: {},
          state: 'ACTIVE'
        }),
      set: jest.fn()
    }

    onUpdated({
      downloadId,
      item,
      state,
      store
    })

    expect(store.set).toHaveBeenCalledTimes(1)
    expect(store.set).toHaveBeenCalledWith('downloads.mock-download-id.files.mock-filename\\.png', {
      percent: 42,
      state: 'ACTIVE',
      timeStart: 1684029600000,
      url: 'http://example.com/mock-filename.png'
    })
  })

  test('updates the store for paused downloads', () => {
    const downloadId = 'mock-download-id'
    const item = {
      getFilename: jest.fn().mockReturnValue('mock-filename.png'),
      getReceivedBytes: jest.fn().mockReturnValue(42),
      getTotalBytes: jest.fn().mockReturnValue(100),
      isPaused: jest.fn().mockReturnValue(true)
    }
    const state = 'progressing'
    const store = {
      get: jest.fn()
        .mockReturnValueOnce({
          // storeItem
          url: 'http://example.com/mock-filename.png',
          state: 'ACTIVE',
          percent: 42,
          timeStart: 1684029600000
        })
        .mockReturnValueOnce({
          // storeDownload
          downloadLocation: '',
          timeStart: 1684029600000,
          files: {},
          state: 'ACTIVE'
        }),
      set: jest.fn()
    }

    onUpdated({
      downloadId,
      item,
      state,
      store
    })

    expect(store.set).toHaveBeenCalledTimes(1)
    expect(store.set).toHaveBeenCalledWith('downloads.mock-download-id.files.mock-filename\\.png', {
      percent: 42,
      state: 'PAUSED',
      timeStart: 1684029600000,
      url: 'http://example.com/mock-filename.png'
    })
  })
})
