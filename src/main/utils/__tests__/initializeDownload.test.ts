import { app } from 'electron'

import initializeDownload from '../initializeDownload'

jest.mock('electron', () => ({
  app: {
    getPath: jest.fn().mockReturnValue('/system/default')
  }
}))

describe('initializeDownload', () => {
  test('sends the initializeDownload message with the system default downloadLocation', async () => {
    const webContents = {
      send: jest.fn()
    }
    const database = {
      getPreferences: jest.fn().mockResolvedValue({})
    }
    const downloadIds = ['mockDownloadId']

    await initializeDownload({
      database,
      downloadIds,
      webContents
    })

    expect(app.getPath).toHaveBeenCalledTimes(1)

    expect(database.getPreferences).toHaveBeenCalledTimes(1)

    expect(webContents.send).toHaveBeenCalledTimes(1)
    expect(webContents.send).toHaveBeenCalledWith(
      'initializeDownload',
      {
        downloadIds: ['mockDownloadId'],
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
      getPreferences: jest.fn().mockResolvedValue({
        lastDownloadLocation: '/last/download/location'
      })
    }
    const downloadIds = ['mockDownloadId']

    await initializeDownload({
      database,
      downloadIds,
      webContents
    })

    expect(app.getPath).toHaveBeenCalledTimes(1)

    expect(database.getPreferences).toHaveBeenCalledTimes(1)

    expect(webContents.send).toHaveBeenCalledTimes(1)
    expect(webContents.send).toHaveBeenCalledWith(
      'initializeDownload',
      {
        downloadIds: ['mockDownloadId'],
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
      getPreferences: jest.fn().mockResolvedValue({
        lastDownloadLocation: '/last/download/location',
        defaultDownloadLocation: '/default/download/location'
      })
    }
    const downloadIds = ['mockDownloadId']

    await initializeDownload({
      database,
      downloadIds,
      webContents
    })

    expect(app.getPath).toHaveBeenCalledTimes(1)

    expect(database.getPreferences).toHaveBeenCalledTimes(1)

    expect(webContents.send).toHaveBeenCalledTimes(1)
    expect(webContents.send).toHaveBeenCalledWith(
      'initializeDownload',
      {
        downloadIds: ['mockDownloadId'],
        downloadLocation: '/default/download/location',
        shouldUseDefaultLocation: true
      }
    )
  })
})
