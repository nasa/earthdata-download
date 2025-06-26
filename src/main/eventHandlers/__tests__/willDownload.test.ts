// @ts-nocheck

import MockDate from 'mockdate'

import willDownload from '../willDownload'

import sendToLogin from '../sendToLogin'

import downloadStates from '../../../app/constants/downloadStates'
import metricsEvent from '../../../app/constants/metricsEvent'
import metricsLogger from '../../utils/metricsLogger'
import downloadIdForMetrics from '../../utils/downloadIdForMetrics'
import startNextDownload from '../../utils/startNextDownload'
import verifyDownload from '../../utils/verifyDownload'
import finishDownload from '../willDownloadEvents/finishDownload'
import onUpdated from '../willDownloadEvents/onUpdated'
import onDone from '../willDownloadEvents/onDone'

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

jest.mock('../../utils/metricsLogger.ts', () => ({
  __esModule: true,
  default: jest.fn(() => {})
}))

jest.mock('../../utils/verifyDownload', () => ({
  __esModule: true,
  default: jest.fn()
    // 'when the download errors'
    .mockResolvedValueOnce(true)
    // 'when the download needs auth'
    .mockResolvedValueOnce(true)
    // 'when the download needs EULA acceptance'
    .mockResolvedValueOnce(false)
    // 'when the received bytes is equal to the total bytes'
    .mockResolvedValueOnce(true)
}))

jest.mock('../willDownloadEvents/finishDownload', () => ({
  __esModule: true,
  default: jest.fn(() => { })
}))

jest.mock('../willDownloadEvents/onUpdated')
jest.mock('../willDownloadEvents/onDone')

beforeEach(() => {
  MockDate.set('2023-05-13T22:00:00')
})

describe('willDownload', () => {
  test('starts the download', async () => {
    const currentDownloadItems = {
      addItem: jest.fn(),
      cancelItem: jest.fn()
    }
    const database = {
      getDownloadById: jest.fn().mockResolvedValue({ state: downloadStates.active }),
      getFileWhere: jest.fn().mockResolvedValue({ state: downloadStates.active }),
      updateDownloadById: jest.fn(),
      updateFileById: jest.fn()
    }
    const downloadIdContext = {
      'http://example.com/mock-filename.png': {
        downloadId: 'mock-download-id',
        downloadLocation: '/mock/location/mock-download-id',
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
      getReceivedBytes: jest.fn().mockReturnValue(0),
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
    expect(item.setSavePath).toHaveBeenCalledWith('/mock/location/mock-download-id/mock-filename.png')

    expect(database.getDownloadById).toHaveBeenCalledTimes(1)
    expect(database.getDownloadById).toHaveBeenCalledWith('mock-download-id')

    expect(database.updateDownloadById).toHaveBeenCalledTimes(0)

    expect(database.updateFileById).toHaveBeenCalledTimes(1)
    expect(database.updateFileById).toHaveBeenCalledWith(123, {
      timeStart: 1684029600000
    })

    expect(currentDownloadItems.addItem).toHaveBeenCalledTimes(1)
    expect(currentDownloadItems.cancelItem).toHaveBeenCalledTimes(0)
  })

  test('does not start the download without a downloadId', async () => {
    const currentDownloadItems = {
      addItem: jest.fn(),
      cancelItem: jest.fn()
    }
    const database = {
      getDownloadById: jest.fn().mockResolvedValue({
        authUrl: '',
        state: downloadStates.active
      }),
      getFileWhere: jest.fn().mockResolvedValue({ state: downloadStates.active }),
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
      once: jest.fn(),
      getReceivedBytes: jest.fn().mockReturnValue(0),
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

    expect(item.cancel).toHaveBeenCalledTimes(1)

    expect(database.getDownloadById).toHaveBeenCalledTimes(0)
    expect(item.setSavePath).toHaveBeenCalledTimes(0)
    expect(database.getDownloadById).toHaveBeenCalledTimes(0)
    expect(database.updateDownloadById).toHaveBeenCalledTimes(0)
    expect(database.updateFileById).toHaveBeenCalledTimes(0)
    expect(currentDownloadItems.addItem).toHaveBeenCalledTimes(0)
    expect(currentDownloadItems.cancelItem).toHaveBeenCalledTimes(0)
  })

  describe('when the download errors', () => {
    test('updates the file state', async () => {
      const currentDownloadItems = {
        addItem: jest.fn(),
        cancelItem: jest.fn()
      }
      const database = {
        getDownloadById: jest.fn().mockResolvedValue({
          errors: [],
          state: downloadStates.active
        }),
        getFileWhere: jest.fn().mockResolvedValue({ state: downloadStates.active }),
        updateFileById: jest.fn()
      }
      const downloadIdContext = {
        'http://example.com/mock-filename.png': {
          downloadId: 'mock-download-id',
          downloadLocation: '/mock/location/mock-download-id',
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
        getReceivedBytes: jest.fn().mockReturnValue(0),
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

      expect(metricsLogger).toHaveBeenCalledTimes(1)
      expect(metricsLogger).toHaveBeenCalledWith(database, {
        eventType: metricsEvent.downloadErrored,
        data: {
          downloadId: downloadIdForMetrics('mock-download-id'),
          filename: 'mock-filename.png',
          reason: 'File reported a size of 0 bytes.'
        }
      })

      expect(item.setSavePath).toHaveBeenCalledTimes(1)
      expect(item.setSavePath).toHaveBeenCalledWith('/mock/location/mock-download-id/mock-filename.png')

      expect(database.getDownloadById).toHaveBeenCalledTimes(1)
      expect(database.getDownloadById).toHaveBeenCalledWith('mock-download-id')

      expect(database.updateFileById).toHaveBeenCalledTimes(1)
      expect(database.updateFileById).toHaveBeenCalledWith(
        123,
        {
          state: downloadStates.error,
          errors: 'This file could not be downloaded'
        }
      )

      expect(currentDownloadItems.addItem).toHaveBeenCalledTimes(1)
      expect(currentDownloadItems.cancelItem).toHaveBeenCalledTimes(1)

      expect(startNextDownload).toHaveBeenCalledTimes(1)
      expect(startNextDownload).toHaveBeenCalledWith(expect.objectContaining({
        downloadId: 'mock-download-id'
      }))
    })
  })

  describe('when the download needs auth', () => {
    test('calls sendToLogin', async () => {
      const currentDownloadItems = {
        addItem: jest.fn(),
        cancelItem: jest.fn()
      }
      const database = {
        getDownloadById: jest.fn().mockResolvedValue({
          authUrl: 'http://example.com/login',
          state: downloadStates.active
        }),
        getFileWhere: jest.fn().mockResolvedValue({ state: downloadStates.active }),
        updateDownloadById: jest.fn(),
        updateFileById: jest.fn()
      }
      const downloadIdContext = {
        'http://example.com/mock-filename.png': {
          downloadId: 'mock-download-id',
          downloadLocation: '/mock/location/mock-download-id',
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
        cancel: jest.fn(),
        on: jest.fn(),
        once: jest.fn(),
        getReceivedBytes: jest.fn().mockReturnValue(0),
        getTotalBytes: jest.fn().mockReturnValue(0)
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
      expect(item.setSavePath).toHaveBeenCalledWith('/mock/location/mock-download-id/mock-filename.png')

      expect(database.getDownloadById).toHaveBeenCalledTimes(1)
      expect(database.getDownloadById).toHaveBeenCalledWith('mock-download-id')

      expect(sendToLogin).toHaveBeenCalledTimes(1)
      expect(sendToLogin).toHaveBeenCalledWith(expect.objectContaining({
        info: {
          downloadId: 'mock-download-id',
          fileId: 123
        }
      }))

      expect(database.updateDownloadById).toHaveBeenCalledTimes(1)
      expect(database.updateDownloadById).toHaveBeenCalledWith(
        'mock-download-id',
        {
          state: downloadStates.waitingForAuth
        }
      )

      expect(database.updateFileById).toHaveBeenCalledTimes(0)

      expect(currentDownloadItems.addItem).toHaveBeenCalledTimes(1)
      expect(currentDownloadItems.cancelItem).toHaveBeenCalledTimes(1)
    })
  })

  describe('when the download needs EULA acceptance', () => {
    test('cancels the download', async () => {
      const currentDownloadItems = {
        addItem: jest.fn(),
        cancelItem: jest.fn()
      }
      const database = {
        getDownloadById: jest.fn().mockResolvedValue({
          authUrl: 'http://example.com/login',
          state: downloadStates.active
        }),
        getFileWhere: jest.fn().mockResolvedValue({ state: downloadStates.active }),
        updateDownloadById: jest.fn(),
        updateFileById: jest.fn()
      }
      const downloadIdContext = {
        'http://example.com/mock-filename.png': {
          downloadId: 'mock-download-id',
          downloadLocation: '/mock/location/mock-download-id',
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
        getReceivedBytes: jest.fn().mockReturnValue(0),
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
      expect(item.setSavePath).toHaveBeenCalledWith('/mock/location/mock-download-id/mock-filename.png')

      expect(database.getDownloadById).toHaveBeenCalledTimes(1)
      expect(database.getDownloadById).toHaveBeenCalledWith('mock-download-id')

      expect(currentDownloadItems.addItem).toHaveBeenCalledTimes(1)
      expect(currentDownloadItems.cancelItem).toHaveBeenCalledTimes(1)

      expect(verifyDownload).toHaveBeenCalledTimes(1)
      expect(verifyDownload).toHaveBeenCalledWith(expect.objectContaining({
        downloadId: 'mock-download-id',
        downloadsWaitingForAuth: {},
        downloadsWaitingForEula: {},
        fileId: 123,
        url: 'http://example.com/mock-filename.png'
      }))

      expect(database.updateDownloadById).toHaveBeenCalledTimes(0)

      expect(database.updateFileById).toHaveBeenCalledTimes(0)
    })
  })

  describe('when the received bytes is equal to the total bytes', () => {
    test('finishes the download', async () => {
      const currentDownloadItems = {
        addItem: jest.fn(),
        cancelItem: jest.fn()
      }
      const database = {
        getDownloadById: jest.fn().mockResolvedValue({
          authUrl: 'http://example.com/login',
          state: downloadStates.active
        }),
        getFileWhere: jest.fn().mockResolvedValue({ state: downloadStates.active }),
        updateDownloadById: jest.fn(),
        updateFileById: jest.fn()
      }
      const downloadIdContext = {
        'http://example.com/mock-filename.png': {
          downloadId: 'mock-download-id',
          downloadLocation: '/mock/location/mock-download-id',
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
        getReceivedBytes: jest.fn().mockReturnValue(100),
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
      expect(item.setSavePath).toHaveBeenCalledWith('/mock/location/mock-download-id/mock-filename.png')

      expect(database.getDownloadById).toHaveBeenCalledTimes(1)
      expect(database.getDownloadById).toHaveBeenCalledWith('mock-download-id')

      expect(currentDownloadItems.addItem).toHaveBeenCalledTimes(1)
      expect(currentDownloadItems.cancelItem).toHaveBeenCalledTimes(0)

      expect(verifyDownload).toHaveBeenCalledTimes(1)
      expect(verifyDownload).toHaveBeenCalledWith(expect.objectContaining({
        downloadId: 'mock-download-id',
        downloadsWaitingForAuth: {},
        downloadsWaitingForEula: {},
        fileId: 123,
        url: 'http://example.com/mock-filename.png'
      }))

      expect(database.updateDownloadById).toHaveBeenCalledTimes(0)

      expect(database.updateFileById).toHaveBeenCalledTimes(1)
      expect(database.updateFileById).toHaveBeenCalledWith(123, {
        percent: 100,
        state: downloadStates.completed,
        timeEnd: 1684029600000,
        timeStart: 1684029600000
      })

      expect(finishDownload).toHaveBeenCalledTimes(1)
      expect(finishDownload).toHaveBeenCalledWith(expect.objectContaining({
        downloadId: 'mock-download-id'
      }))
    })
  })

  describe('when the download has been cancelled', () => {
    test('cancels the file', async () => {
      const currentDownloadItems = {
        addItem: jest.fn(),
        cancelItem: jest.fn()
      }
      const database = {
        getDownloadById: jest.fn().mockResolvedValue({
          authUrl: 'http://example.com/login',
          state: downloadStates.cancelled
        }),
        getFileWhere: jest.fn().mockResolvedValue({ state: downloadStates.active }),
        updateDownloadById: jest.fn(),
        updateFileById: jest.fn()
      }
      const downloadIdContext = {
        'http://example.com/mock-filename.png': {
          downloadId: 'mock-download-id',
          downloadLocation: '/mock/location/mock-download-id',
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
        getReceivedBytes: jest.fn().mockReturnValue(100),
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
      expect(item.setSavePath).toHaveBeenCalledWith('/mock/location/mock-download-id/mock-filename.png')

      expect(database.getDownloadById).toHaveBeenCalledTimes(1)
      expect(database.getDownloadById).toHaveBeenCalledWith('mock-download-id')

      expect(currentDownloadItems.addItem).toHaveBeenCalledTimes(1)

      expect(currentDownloadItems.cancelItem).toHaveBeenCalledTimes(1)
      expect(currentDownloadItems.cancelItem).toHaveBeenCalledWith('mock-download-id', 'mock-filename.png')

      expect(verifyDownload).toHaveBeenCalledTimes(0)
      expect(database.updateDownloadById).toHaveBeenCalledTimes(0)
      expect(database.updateFileById).toHaveBeenCalledTimes(0)
      expect(finishDownload).toHaveBeenCalledTimes(0)
    })
  })

  describe('when the download has been paused', () => {
    test('pauses the file', async () => {
      const currentDownloadItems = {
        addItem: jest.fn(),
        cancelItem: jest.fn(),
        pauseItem: jest.fn()
      }
      const database = {
        getDownloadById: jest.fn().mockResolvedValue({
          authUrl: 'http://example.com/login',
          state: downloadStates.paused
        }),
        getFileWhere: jest.fn().mockResolvedValue({ state: downloadStates.active }),
        updateDownloadById: jest.fn(),
        updateFileById: jest.fn()
      }
      const downloadIdContext = {
        'http://example.com/mock-filename.png': {
          downloadId: 'mock-download-id',
          downloadLocation: '/mock/location/mock-download-id',
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
        getReceivedBytes: jest.fn().mockReturnValue(100),
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
      expect(item.setSavePath).toHaveBeenCalledWith('/mock/location/mock-download-id/mock-filename.png')

      expect(database.getDownloadById).toHaveBeenCalledTimes(1)
      expect(database.getDownloadById).toHaveBeenCalledWith('mock-download-id')

      expect(currentDownloadItems.addItem).toHaveBeenCalledTimes(1)

      expect(currentDownloadItems.cancelItem).toHaveBeenCalledTimes(0)

      expect(currentDownloadItems.pauseItem).toHaveBeenCalledTimes(1)
      expect(currentDownloadItems.pauseItem).toHaveBeenCalledWith('mock-download-id', 'mock-filename.png')

      expect(verifyDownload).toHaveBeenCalledTimes(0)
      expect(database.updateDownloadById).toHaveBeenCalledTimes(0)
      expect(database.updateFileById).toHaveBeenCalledTimes(0)
      expect(finishDownload).toHaveBeenCalledTimes(0)
    })
  })

  describe('when the `updated` event is called', () => {
    test('calls onUpdated', async () => {
      const currentDownloadItems = {
        addItem: jest.fn(),
        cancelItem: jest.fn()
      }
      const database = {
        getDownloadById: jest.fn().mockResolvedValue({ state: downloadStates.active }),
        getFileWhere: jest.fn().mockResolvedValue({ state: downloadStates.active }),
        updateDownloadById: jest.fn(),
        updateFileById: jest.fn()
      }
      const downloadIdContext = {
        'http://example.com/mock-filename.png': {
          downloadId: 'mock-download-id',
          downloadLocation: '/mock/location/mock-download-id',
          fileId: 123
        }
      }
      const channels = {}
      const downloadsWaitingForAuth = {}
      const item = {
        getFilename: jest.fn().mockReturnValue('mock-filename.png'),
        setSavePath: jest.fn(),
        getURLChain: jest.fn().mockReturnValue(['http://example.com/mock-filename.png']),
        on: (channel, callback) => {
          channels[channel] = callback
        },
        once: (channel, callback) => {
          channels[channel] = callback
        },
        send: (channel, event, state) => {
          channels[channel](event, state)
        },
        getReceivedBytes: jest.fn().mockReturnValue(0),
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

      item.send('updated', {}, 'progressing')

      expect(onUpdated).toHaveBeenCalledTimes(1)
      expect(onUpdated).toHaveBeenCalledWith({
        database,
        downloadId: 'mock-download-id',
        item,
        state: 'progressing'
      })
    })
  })

  describe('when the `done` event is called', () => {
    test('calls onDone', async () => {
      const currentDownloadItems = {
        addItem: jest.fn(),
        cancelItem: jest.fn()
      }
      const database = {
        getDownloadById: jest.fn().mockResolvedValue({ state: downloadStates.active }),
        getFileWhere: jest.fn().mockResolvedValue({ state: downloadStates.active }),
        updateDownloadById: jest.fn(),
        updateFileById: jest.fn()
      }
      const downloadIdContext = {
        'http://example.com/mock-filename.png': {
          downloadId: 'mock-download-id',
          downloadLocation: '/mock/location/mock-download-id',
          fileId: 123
        }
      }
      const channels = {}
      const downloadsWaitingForAuth = {}
      const item = {
        getFilename: jest.fn().mockReturnValue('mock-filename.png'),
        setSavePath: jest.fn(),
        getURLChain: jest.fn().mockReturnValue(['http://example.com/mock-filename.png']),
        on: (channel, callback) => {
          channels[channel] = callback
        },
        once: (channel, callback) => {
          channels[channel] = callback
        },
        send: (channel, event, state) => {
          channels[channel](event, state)
        },
        getReceivedBytes: jest.fn().mockReturnValue(0),
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

      item.send('done', {}, 'completed')

      expect(onDone).toHaveBeenCalledTimes(1)
      expect(onDone).toHaveBeenCalledWith({
        currentDownloadItems,
        database,
        downloadId: 'mock-download-id',
        downloadIdContext,
        item,
        state: 'completed',
        webContents
      })
    })
  })
})
