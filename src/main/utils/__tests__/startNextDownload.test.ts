// @ts-nocheck

import MockDate from 'mockdate'

import startNextDownload from '../startNextDownload'

import downloadFile from '../downloadFile'

import downloadStates from '../../../app/constants/downloadStates'

jest.mock('../downloadFile', () => ({
  __esModule: true,
  default: jest.fn(() => { })
}))

beforeEach(() => {
  MockDate.set('2023-05-13T22:00:00')
})

describe('startNextDownload', () => {
  test('starts downloading the next file', async () => {
    const downloadId = 'mock-download-id'
    const downloadIdContext = {}
    const database = {
      getPreferences: jest.fn().mockResolvedValue({ concurrentDownloads: 2 }),
      getFilesToStart: jest.fn().mockResolvedValue([{
        id: 123,
        filename: 'mock-filename-1.png',
        downloadId,
        url: 'http://example.com/mock-filename-1.png',
        state: 'PENDING',
        percent: 0
      }]),
      getFileCountWhere: jest.fn().mockResolvedValue(0)
    }
    const webContents = {
      downloadURL: jest.fn()
    }
    const currentDownloadItems = {
      getNumberOfDownloads: jest.fn().mockReturnValue(1)
    }

    await startNextDownload({
      currentDownloadItems,
      database,
      downloadIdContext,
      fileId: undefined,
      webContents
    })

    expect(database.getPreferences).toHaveBeenCalledTimes(1)

    expect(database.getFileCountWhere).toHaveBeenCalledTimes(1)
    expect(database.getFileCountWhere).toHaveBeenCalledWith({ state: downloadStates.starting })

    expect(database.getFilesToStart).toHaveBeenCalledTimes(1)
    expect(database.getFilesToStart).toHaveBeenCalledWith(1, undefined)

    expect(downloadFile).toHaveBeenCalledTimes(1)
    expect(downloadFile).toHaveBeenCalledWith(expect.objectContaining({
      file: {
        id: 123,
        filename: 'mock-filename-1.png',
        downloadId,
        url: 'http://example.com/mock-filename-1.png',
        state: 'PENDING',
        percent: 0
      }
    }))
  })

  test('starts downloading the next file when the fileId is provided', async () => {
    const downloadId = 'mock-download-id'
    const downloadIdContext = {}
    const database = {
      getPreferences: jest.fn().mockResolvedValue({ concurrentDownloads: 2 }),
      getFilesToStart: jest.fn().mockResolvedValue([{
        id: 123,
        filename: 'mock-filename-1.png',
        downloadId,
        url: 'http://example.com/mock-filename-1.png',
        state: 'PENDING',
        percent: 0
      }]),
      getFileCountWhere: jest.fn().mockResolvedValue(0)
    }
    const webContents = {
      downloadURL: jest.fn()
    }
    const currentDownloadItems = {
      getNumberOfDownloads: jest.fn().mockReturnValue(1)
    }

    await startNextDownload({
      currentDownloadItems,
      database,
      downloadIdContext,
      fileId: 123,
      webContents
    })

    expect(database.getPreferences).toHaveBeenCalledTimes(1)

    expect(database.getFileCountWhere).toHaveBeenCalledTimes(1)
    expect(database.getFileCountWhere).toHaveBeenCalledWith({ state: downloadStates.starting })

    expect(database.getFilesToStart).toHaveBeenCalledTimes(1)
    expect(database.getFilesToStart).toHaveBeenCalledWith(1, 123)

    expect(downloadFile).toHaveBeenCalledTimes(1)
    expect(downloadFile).toHaveBeenCalledWith(expect.objectContaining({
      file: {
        id: 123,
        filename: 'mock-filename-1.png',
        downloadId,
        url: 'http://example.com/mock-filename-1.png',
        state: 'PENDING',
        percent: 0
      }
    }))
  })

  test('starts downloading multiple files', async () => {
    const downloadId = 'mock-download-id'
    const downloadIdContext = {}
    const database = {
      getPreferences: jest.fn().mockResolvedValue({ concurrentDownloads: 2 }),
      getFilesToStart: jest.fn().mockResolvedValue([{
        id: 123,
        filename: 'mock-filename-1.png',
        downloadId,
        url: 'http://example.com/mock-filename-1.png',
        state: 'PENDING',
        percent: 0
      }, {
        id: 456,
        filename: 'mock-filename-2.png',
        downloadId: 'mock-download-id2',
        url: 'http://example.com/mock-filename-2.png',
        state: 'PENDING',
        percent: 0
      }]),
      getFileCountWhere: jest.fn().mockResolvedValue(0)
    }
    const webContents = {
      downloadURL: jest.fn()
    }
    const currentDownloadItems = {
      getNumberOfDownloads: jest.fn().mockReturnValue(0)
    }

    await startNextDownload({
      currentDownloadItems,
      database,
      downloadIdContext,
      fileId: undefined,
      webContents
    })

    expect(database.getPreferences).toHaveBeenCalledTimes(1)

    expect(database.getFileCountWhere).toHaveBeenCalledTimes(1)
    expect(database.getFileCountWhere).toHaveBeenCalledWith({ state: downloadStates.starting })

    expect(database.getFilesToStart).toHaveBeenCalledTimes(1)
    expect(database.getFilesToStart).toHaveBeenCalledWith(2, undefined)

    expect(downloadFile).toHaveBeenCalledTimes(2)
    expect(downloadFile).toHaveBeenCalledWith(expect.objectContaining({
      file: {
        id: 123,
        filename: 'mock-filename-1.png',
        downloadId,
        url: 'http://example.com/mock-filename-1.png',
        state: 'PENDING',
        percent: 0
      }
    }))

    expect(downloadFile).toHaveBeenCalledWith(expect.objectContaining({
      file: {
        id: 456,
        filename: 'mock-filename-2.png',
        downloadId: 'mock-download-id2',
        url: 'http://example.com/mock-filename-2.png',
        state: 'PENDING',
        percent: 0
      }
    }))
  })

  test('does not start downloading a file if the concurrentDownloads is met', async () => {
    const downloadIdContext = {}
    const database = {
      getPreferences: jest.fn().mockResolvedValue({ concurrentDownloads: 1 }),
      getFilesToStart: jest.fn(),
      getFileCountWhere: jest.fn().mockResolvedValue(0)
    }
    const webContents = {
      downloadURL: jest.fn()
    }
    const currentDownloadItems = {
      getNumberOfDownloads: jest.fn().mockReturnValue(1)
    }

    await startNextDownload({
      currentDownloadItems,
      database,
      downloadIdContext,
      fileId: undefined,
      webContents
    })

    expect(database.getPreferences).toHaveBeenCalledTimes(1)

    expect(database.getFileCountWhere).toHaveBeenCalledTimes(1)
    expect(database.getFileCountWhere).toHaveBeenCalledWith({ state: downloadStates.starting })

    expect(database.getFilesToStart).toHaveBeenCalledTimes(0)

    expect(downloadFile).toHaveBeenCalledTimes(0)
  })

  test('does not start downloading a file if the concurrentDownloads is met because of other starting files', async () => {
    const downloadIdContext = {}
    const database = {
      getPreferences: jest.fn().mockResolvedValue({ concurrentDownloads: 2 }),
      getFilesToStart: jest.fn(),
      getFileCountWhere: jest.fn().mockResolvedValue(1)
    }
    const webContents = {
      downloadURL: jest.fn()
    }
    const currentDownloadItems = {
      getNumberOfDownloads: jest.fn().mockReturnValue(1)
    }

    await startNextDownload({
      currentDownloadItems,
      database,
      downloadIdContext,
      fileId: undefined,
      webContents
    })

    expect(database.getPreferences).toHaveBeenCalledTimes(1)

    expect(database.getFileCountWhere).toHaveBeenCalledTimes(1)
    expect(database.getFileCountWhere).toHaveBeenCalledWith({ state: downloadStates.starting })

    expect(database.getFilesToStart).toHaveBeenCalledTimes(0)

    expect(downloadFile).toHaveBeenCalledTimes(0)
  })

  test('does not start downloading a file if no files need to be started', async () => {
    const downloadIdContext = {}
    const database = {
      getPreferences: jest.fn().mockResolvedValue({ concurrentDownloads: 1 }),
      getFilesToStart: jest.fn().mockResolvedValue([]),
      getFileCountWhere: jest.fn().mockResolvedValue(0)
    }
    const webContents = {
      downloadURL: jest.fn()
    }
    const currentDownloadItems = {
      getNumberOfDownloads: jest.fn().mockReturnValue(0)
    }

    await startNextDownload({
      currentDownloadItems,
      database,
      downloadIdContext,
      fileId: undefined,
      webContents
    })

    expect(database.getPreferences).toHaveBeenCalledTimes(1)

    expect(database.getFileCountWhere).toHaveBeenCalledTimes(1)
    expect(database.getFileCountWhere).toHaveBeenCalledWith({ state: downloadStates.starting })

    expect(database.getFilesToStart).toHaveBeenCalledTimes(1)
    expect(database.getFilesToStart).toHaveBeenCalledWith(1, undefined)

    expect(downloadFile).toHaveBeenCalledTimes(0)
  })
})
