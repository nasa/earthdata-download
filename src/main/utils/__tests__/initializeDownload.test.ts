import { app } from 'electron'

import initializeDownload from '../initializeDownload'
import metricsLogger from '../metricsLogger'

jest.mock('electron', () => ({
  app: {
    getPath: jest.fn().mockReturnValue('/system/default')
  }
}))

jest.mock('../../utils/metricsLogger.ts', () => ({
  __esModule: true,
  default: jest.fn(() => {})
}))

describe('initializeDownload', () => {
  test('sends the initializeDownload message with the system default downloadLocation', async () => {
    const webContents = {
      send: jest.fn()
    }
    const database = {
      getDownloadById: jest.fn().mockResolvedValue({
        clientId: 'eed-edsc-dev-serverless-client',
        downloadId: 'mock-download-id'
      }),
      getPreferences: jest.fn().mockResolvedValue({})
    }
    const downloadIds = ['mock-download-id']

    await initializeDownload({
      database,
      downloadIds,
      webContents
    })

    expect(metricsLogger).toHaveBeenCalledTimes(1)
    expect(metricsLogger).toHaveBeenCalledWith({
      eventType: 'DownloadStarted',
      data: {
        downloadIds: [{
          clientId: 'eed-edsc-dev-serverless-client',
          downloadId: 'mock-download-id'
        }],
        downloadCount: 1
      }
    })

    expect(database.getDownloadById).toHaveBeenCalledTimes(1)
    expect(database.getDownloadById).toHaveBeenCalledWith('mock-download-id')

    expect(app.getPath).toHaveBeenCalledTimes(1)

    expect(database.getPreferences).toHaveBeenCalledTimes(1)

    expect(webContents.send).toHaveBeenCalledTimes(1)
    expect(webContents.send).toHaveBeenCalledWith(
      'initializeDownload',
      {
        downloadIds: ['mock-download-id'],
        downloadLocation: '/system/default',
        shouldUseDefaultLocation: false
      }
    )
  })

  test('sends the initializeDownload message with the last used downloadLocation', async () => {
    const webContents = {
      send: jest.fn()
    }
    const database = {
      getDownloadById: jest.fn().mockResolvedValue({
        clientId: 'eed-edsc-dev-serverless-client',
        downloadId: 'mock-download-id'
      }),
      getPreferences: jest.fn().mockResolvedValue({
        lastDownloadLocation: '/last/download/location'
      })
    }
    const downloadIds = ['mock-download-id']

    await initializeDownload({
      database,
      downloadIds,
      webContents
    })

    expect(metricsLogger).toHaveBeenCalledTimes(1)
    expect(metricsLogger).toHaveBeenCalledWith({
      eventType: 'DownloadStarted',
      data: {
        downloadIds: [{
          clientId: 'eed-edsc-dev-serverless-client',
          downloadId: 'mock-download-id'
        }],
        downloadCount: 1
      }
    })

    expect(database.getDownloadById).toHaveBeenCalledTimes(1)
    expect(database.getDownloadById).toHaveBeenCalledWith('mock-download-id')

    expect(app.getPath).toHaveBeenCalledTimes(1)

    expect(database.getPreferences).toHaveBeenCalledTimes(1)

    expect(webContents.send).toHaveBeenCalledTimes(1)
    expect(webContents.send).toHaveBeenCalledWith(
      'initializeDownload',
      {
        downloadIds: ['mock-download-id'],
        downloadLocation: '/last/download/location',
        shouldUseDefaultLocation: false
      }
    )
  })

  test('sends the initializeDownload message with the default downloadLocation', async () => {
    const webContents = {
      send: jest.fn()
    }
    const database = {
      getDownloadById: jest.fn().mockResolvedValue({
        clientId: 'eed-edsc-dev-serverless-client',
        downloadId: 'mock-download-id'
      }),
      getPreferences: jest.fn().mockResolvedValue({
        lastDownloadLocation: '/last/download/location',
        defaultDownloadLocation: '/default/download/location'
      })
    }
    const downloadIds = ['mock-download-id']

    await initializeDownload({
      database,
      downloadIds,
      webContents
    })

    expect(metricsLogger).toHaveBeenCalledTimes(1)
    expect(metricsLogger).toHaveBeenCalledWith({
      eventType: 'DownloadStarted',
      data: {
        downloadIds: [{
          clientId: 'eed-edsc-dev-serverless-client',
          downloadId: 'mock-download-id'
        }],
        downloadCount: 1
      }
    })

    expect(database.getDownloadById).toHaveBeenCalledTimes(1)
    expect(database.getDownloadById).toHaveBeenCalledWith('mock-download-id')

    expect(app.getPath).toHaveBeenCalledTimes(1)

    expect(database.getPreferences).toHaveBeenCalledTimes(1)

    expect(webContents.send).toHaveBeenCalledTimes(1)
    expect(webContents.send).toHaveBeenCalledWith(
      'initializeDownload',
      {
        downloadIds: ['mock-download-id'],
        downloadLocation: '/default/download/location',
        shouldUseDefaultLocation: true
      }
    )
  })
})
