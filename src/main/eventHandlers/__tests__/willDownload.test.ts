import MockDate from 'mockdate'

import willDownload from '../willDownload'

beforeEach(() => {
  MockDate.set('2023-05-13T22:00:00')
})

describe('willDownload', () => {
  test('starts the download', async () => {
    const currentDownloadItems = {
      addItem: jest.fn()
    }
    const database = {
      getDownloadById: jest.fn().mockResolvedValue({ reAuthUrl: '' }),
      updateDownloadById: jest.fn(),
      updateFile: jest.fn()
    }
    const downloadIdContext = {
      'http://example.com/mock-filename.png': {
        downloadId: 'shortName_version-1-20230514_012554',
        downloadLocation: '/mock/location/shortName_version-1-20230514_012554',
        fileId: 123
      }
    }
    const item = {
      getFilename: jest.fn().mockReturnValue('mock-filename.png'),
      setSavePath: jest.fn(),
      getURLChain: jest.fn().mockReturnValue(['http://example.com/mock-filename.png']),
      on: jest.fn(),
      once: jest.fn()
    }
    const webContents = {
      send: jest.fn()
    }

    await willDownload({
      currentDownloadItems,
      database,
      downloadIdContext,
      item,
      webContents
    })

    expect(item.setSavePath).toHaveBeenCalledTimes(1)
    expect(item.setSavePath).toHaveBeenCalledWith('/mock/location/shortName_version-1-20230514_012554/mock-filename.png')

    expect(database.getDownloadById).toHaveBeenCalledTimes(1)
    expect(database.getDownloadById).toHaveBeenCalledWith('shortName_version-1-20230514_012554')

    expect(database.updateDownloadById).toHaveBeenCalledTimes(0)

    expect(database.updateFile).toHaveBeenCalledTimes(1)
    expect(database.updateFile).toHaveBeenCalledWith(123, {
      timeStart: 1684029600000
    })
  })

  test('does not start the download without a downloadId', async () => {
    const currentDownloadItems = {
      addItem: jest.fn()
    }
    const database = {
      getDownloadById: jest.fn().mockResolvedValue({ reAuthUrl: '' }),
      updateDownloadById: jest.fn(),
      updateFile: jest.fn()
    }
    const downloadIdContext = {}
    const item = {
      getFilename: jest.fn().mockReturnValue('mock-filename.png'),
      setSavePath: jest.fn(),
      getURLChain: jest.fn().mockReturnValue(['http://example.com/mock-filename.png']),
      cancel: jest.fn(),
      on: jest.fn(),
      once: jest.fn()
    }
    const webContents = {
      send: jest.fn()
    }

    await willDownload({
      currentDownloadItems,
      database,
      downloadIdContext,
      item,
      webContents
    })

    expect(item.cancel).toHaveBeenCalledTimes(1)

    expect(item.setSavePath).toHaveBeenCalledTimes(0)
    expect(database.getDownloadById).toHaveBeenCalledTimes(0)
    expect(database.updateDownloadById).toHaveBeenCalledTimes(0)
    expect(database.updateFile).toHaveBeenCalledTimes(0)
  })

  // TODO how to test item.on and item.once call the handlers?
})
