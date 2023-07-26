// @ts-nocheck

import MockDate from 'mockdate'

import willDownload from '../willDownload'

import sendToLogin from '../sendToLogin'

import downloadStates from '../../../app/constants/downloadStates'
import startNextDownload from '../../utils/startNextDownload'
import verifyDownload from '../../utils/verifyDownload'

jest.mock('../sendToEula', () => ({
  __esModule: true,
  default: jest.fn(() => {})
}))

jest.mock('../sendToLogin', () => ({
  __esModule: true,
  default: jest.fn(() => {})
}))

jest.mock('../../utils/startNextDownload', () => ({
  __esModule: true,
  default: jest.fn(() => {})
}))

jest.mock('../../utils/verifyDownload', () => ({
  __esModule: true,
  default: jest.fn()
    .mockResolvedValueOnce(true)
    .mockResolvedValueOnce(true)
    .mockResolvedValueOnce(false)
}))

beforeEach(() => {
  MockDate.set('2023-05-13T22:00:00')
})

describe('willDownload', () => {
  test('starts the download', async () => {
    const currentDownloadItems = {
      addItem: jest.fn()
    }
    const database = {
      updateDownloadById: jest.fn(),
      updateFileById: jest.fn()
    }
    const downloadIdContext = {
      'http://example.com/mock-filename.png': {
        downloadId: 'shortName_version-1-20230514_012554',
        downloadLocation: '/mock/location/shortName_version-1-20230514_012554',
        fileId: 123
      }
    }
    const downloadsWaitingForAuth = {}
    const item = {
      getFilename: jest.fn().mockReturnValue('mock-filename.png'),
      setSavePath: jest.fn(),
      getURLChain: jest.fn().mockReturnValue(['http://example.com/mock-filename.png']),
      on: jest.fn(),
      once: jest.fn(),
      getTotalBytes: jest.fn().mockReturnValue(100)
    }
    const webContents = {
      send: jest.fn()
    }

    await willDownload({
      currentDownloadItems,
      database,
      downloadIdContext,
      downloadsWaitingForAuth,
      item,
      webContents
    })

    expect(item.setSavePath).toHaveBeenCalledTimes(1)
    expect(item.setSavePath).toHaveBeenCalledWith('/mock/location/shortName_version-1-20230514_012554/mock-filename.png')

    expect(database.updateDownloadById).toHaveBeenCalledTimes(0)

    expect(database.updateFileById).toHaveBeenCalledTimes(1)
    expect(database.updateFileById).toHaveBeenCalledWith(123, {
      timeStart: 1684029600000
    })
  })

  test('does not start the download without a downloadId', async () => {
    const currentDownloadItems = {
      addItem: jest.fn()
    }
    const database = {
      getDownloadById: jest.fn().mockResolvedValue({ authUrl: '' }),
      updateDownloadById: jest.fn(),
      updateFileById: jest.fn(),
      willDownload: jest.fn().mockResolvedValue(100)
    }
    const downloadIdContext = {}
    const downloadsWaitingForAuth = {}
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
      downloadsWaitingForAuth,
      item,
      webContents
    })

    expect(item.cancel).toHaveBeenCalledTimes(1)

    expect(item.setSavePath).toHaveBeenCalledTimes(0)
    expect(database.getDownloadById).toHaveBeenCalledTimes(0)
    expect(database.updateDownloadById).toHaveBeenCalledTimes(0)
    expect(database.updateFileById).toHaveBeenCalledTimes(0)
  })

  describe('when the download errors', () => {
    test('updates the file state', async () => {
      const currentDownloadItems = {
        addItem: jest.fn()
      }
      const database = {
        getDownloadById: jest.fn().mockResolvedValue({
          errors: []
        }),
        updateFileById: jest.fn()
      }
      const downloadIdContext = {
        'http://example.com/mock-filename.png': {
          downloadId: 'shortName_version-1-20230514_012554',
          downloadLocation: '/mock/location/shortName_version-1-20230514_012554',
          fileId: 123
        }
      }
      const downloadsWaitingForAuth = {}
      const downloadsWaitingForEula = {}
      const item = {
        getFilename: jest.fn().mockReturnValue('mock-filename.png'),
        setSavePath: jest.fn(),
        getURLChain: jest.fn().mockReturnValue(['http://example.com/mock-filename.png']),
        on: jest.fn(),
        once: jest.fn(),
        getTotalBytes: jest.fn().mockReturnValue(0),
        cancel: jest.fn()
      }
      const webContents = {
        send: jest.fn()
      }

      await willDownload({
        currentDownloadItems,
        database,
        downloadIdContext,
        downloadsWaitingForAuth,
        downloadsWaitingForEula,
        item,
        webContents
      })

      expect(item.setSavePath).toHaveBeenCalledTimes(1)
      expect(item.setSavePath).toHaveBeenCalledWith('/mock/location/shortName_version-1-20230514_012554/mock-filename.png')

      expect(database.updateFileById).toHaveBeenCalledTimes(1)
      expect(database.updateFileById).toHaveBeenCalledWith(
        123,
        {
          state: downloadStates.error,
          errors: 'This file could not be downloaded'
        }
      )

      expect(currentDownloadItems.addItem).toHaveBeenCalledTimes(0)

      expect(startNextDownload).toHaveBeenCalledTimes(1)
      expect(startNextDownload).toHaveBeenCalledWith(expect.objectContaining({
        downloadId: 'shortName_version-1-20230514_012554'
      }))
    })
  })

  describe('when the download needs auth', () => {
    test('calls sendToLogin', async () => {
      const currentDownloadItems = {
        addItem: jest.fn()
      }
      const database = {
        getDownloadById: jest.fn().mockResolvedValue({
          authUrl: 'http://example.com/login'
        }),
        updateDownloadById: jest.fn(),
        updateFileById: jest.fn()
      }
      const downloadIdContext = {
        'http://example.com/mock-filename.png': {
          downloadId: 'shortName_version-1-20230514_012554',
          downloadLocation: '/mock/location/shortName_version-1-20230514_012554',
          fileId: 123
        }
      }
      const downloadsWaitingForAuth = {}
      const downloadsWaitingForEula = {}
      const item = {
        getFilename: jest.fn().mockReturnValue('mock-filename.png'),
        setSavePath: jest.fn(),
        getURLChain: jest.fn().mockReturnValue([
          'http://example.com/mock-filename.png',
          'http://urs.earthdata.nasa.gov/oauth/authorize?mock=params'
        ]),
        cancel: jest.fn()
      }
      const webContents = {
        send: jest.fn()
      }

      await willDownload({
        currentDownloadItems,
        database,
        downloadIdContext,
        downloadsWaitingForAuth,
        downloadsWaitingForEula,
        item,
        webContents
      })

      expect(item.setSavePath).toHaveBeenCalledTimes(1)
      expect(item.setSavePath).toHaveBeenCalledWith('/mock/location/shortName_version-1-20230514_012554/mock-filename.png')

      expect(sendToLogin).toHaveBeenCalledTimes(1)
      expect(sendToLogin).toHaveBeenCalledWith(expect.objectContaining({
        info: {
          downloadId: 'shortName_version-1-20230514_012554',
          fileId: 123
        }
      }))

      expect(database.updateDownloadById).toHaveBeenCalledTimes(1)
      expect(database.updateDownloadById).toHaveBeenCalledWith(
        'shortName_version-1-20230514_012554',
        {
          state: downloadStates.waitingForAuth
        }
      )

      expect(database.updateFileById).toHaveBeenCalledTimes(0)

      expect(currentDownloadItems.addItem).toHaveBeenCalledTimes(0)
    })
  })

  describe('when the download needs EULA acceptance', () => {
    test('cancels the download', async () => {
      const currentDownloadItems = {
        addItem: jest.fn()
      }
      const database = {
        getDownloadById: jest.fn().mockResolvedValue({
          authUrl: 'http://example.com/login'
        }),
        updateDownloadById: jest.fn(),
        updateFileById: jest.fn()
      }
      const downloadIdContext = {
        'http://example.com/mock-filename.png': {
          downloadId: 'shortName_version-1-20230514_012554',
          downloadLocation: '/mock/location/shortName_version-1-20230514_012554',
          fileId: 123
        }
      }
      const downloadsWaitingForAuth = {}
      const downloadsWaitingForEula = {}
      const item = {
        getFilename: jest.fn().mockReturnValue('mock-filename.png'),
        setSavePath: jest.fn(),
        getURLChain: jest.fn().mockReturnValue([
          'http://example.com/mock-filename.png'
        ]),
        on: jest.fn(),
        once: jest.fn(),
        cancel: jest.fn(),
        getTotalBytes: jest.fn().mockReturnValue(100)
      }
      const webContents = {
        send: jest.fn()
      }

      await willDownload({
        currentDownloadItems,
        database,
        downloadIdContext,
        downloadsWaitingForAuth,
        downloadsWaitingForEula,
        item,
        webContents
      })

      expect(item.setSavePath).toHaveBeenCalledTimes(1)
      expect(item.setSavePath).toHaveBeenCalledWith('/mock/location/shortName_version-1-20230514_012554/mock-filename.png')

      expect(item.cancel).toHaveBeenCalledTimes(1)

      expect(verifyDownload).toHaveBeenCalledTimes(1)
      expect(verifyDownload).toHaveBeenCalledWith(expect.objectContaining({
        downloadId: 'shortName_version-1-20230514_012554',
        downloadsWaitingForEula: {},
        fileId: 123,
        url: 'http://example.com/mock-filename.png'
      }))

      expect(database.updateDownloadById).toHaveBeenCalledTimes(0)

      expect(database.updateFileById).toHaveBeenCalledTimes(0)

      expect(currentDownloadItems.addItem).toHaveBeenCalledTimes(0)
    })
  })

  // TODO how to test item.on and item.once call the handlers?
})
