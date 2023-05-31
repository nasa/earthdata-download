import MockDate from 'mockdate'

import willDownload from '../willDownload'

beforeEach(() => {
  MockDate.set('2023-05-13T22:00:00')
})

describe('willDownload', () => {
  test('starts the download', () => {
    const currentDownloadItems = {
      addItem: jest.fn()
    }
    const downloadId = 'mock-download-id'
    const item = {
      getFilename: jest.fn().mockReturnValue('mock-filename.png'),
      setSavePath: jest.fn(),
      on: jest.fn(),
      once: jest.fn()
    }
    const store = {
      get: jest.fn().mockReturnValue('/mock/location/shortName_version-1-20230514_012554'),
      set: jest.fn()
    }
    const webContents = {
      send: jest.fn()
    }

    willDownload({
      downloadIdContext: {},
      currentDownloadItems,
      downloadId,
      item,
      store,
      webContents
    })

    expect(item.setSavePath).toHaveBeenCalledTimes(1)
    expect(item.setSavePath).toHaveBeenCalledWith('/mock/location/shortName_version-1-20230514_012554/mock-filename.png')

    expect(store.set).toHaveBeenCalledTimes(1)
    expect(store.set).toHaveBeenCalledWith('downloads.mock-download-id.files.mock-filename\\.png.timeStart', 1684029600000)
  })

  test('does not start the download without a downloadId', () => {
    const currentDownloadItems = {
      addItem: jest.fn()
    }
    const downloadId = undefined
    const item = {
      cancel: jest.fn(),
      getFilename: jest.fn().mockReturnValue('mock-filename.png'),
      setSavePath: jest.fn(),
      on: jest.fn(),
      once: jest.fn()
    }
    const store = {
      get: jest.fn().mockReturnValue('/mock/location/shortName_version-1-20230514_012554'),
      set: jest.fn()
    }
    const webContents = {
      send: jest.fn()
    }

    willDownload({
      downloadIdContext: {},
      currentDownloadItems,
      downloadId,
      item,
      store,
      webContents
    })

    expect(item.cancel).toHaveBeenCalledTimes(1)

    expect(item.setSavePath).toHaveBeenCalledTimes(0)

    expect(store.set).toHaveBeenCalledTimes(0)
  })

  // TODO how to test item.on and item.once call the handlers?
})
