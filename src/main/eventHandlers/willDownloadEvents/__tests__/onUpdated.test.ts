// @ts-nocheck

import MockDate from 'mockdate'

import onUpdated from '../onUpdated'

import downloadStates from '../../../../app/constants/downloadStates'
import setInterruptedDownload from '../setInterruptedDownload'

jest.mock('../setInterruptedDownload', () => ({
  __esModule: true,
  default: jest.fn(() => {})
}))

beforeEach(() => {
  MockDate.set('2023-05-13T22:00:00')
})

describe('onUpdated', () => {
  test('updates the database for interrupted downloads', async () => {
    const downloadId = 'mock-download-id'
    const item = {
      getFilename: jest.fn().mockReturnValue('mock-filename.png'),
      getReceivedBytes: jest.fn().mockReturnValue(42),
      getTotalBytes: jest.fn().mockReturnValue(100)
    }
    const state = 'interrupted'
    const database = {
      getFileWhere: jest.fn().mockResolvedValue({
        id: 123
      }),
      updateFileById: jest.fn(),
      createPauseByDownloadIdAndFilename: jest.fn()
    }

    await onUpdated({
      database,
      downloadId,
      item,
      state
    })

    expect(database.getFileWhere).toHaveBeenCalledTimes(1)
    expect(database.getFileWhere).toHaveBeenCalledWith({
      downloadId: 'mock-download-id',
      filename: 'mock-filename.png'
    })

    expect(database.updateFileById).toHaveBeenCalledTimes(1)
    expect(database.updateFileById).toHaveBeenCalledWith(123, {
      percent: 42,
      state: downloadStates.interrupted
    })

    expect(database.createPauseByDownloadIdAndFilename).toHaveBeenCalledTimes(1)
    expect(database.createPauseByDownloadIdAndFilename).toHaveBeenCalledWith('mock-download-id', 'mock-filename.png')

    expect(setInterruptedDownload).toHaveBeenCalledTimes(1)
    expect(setInterruptedDownload).toHaveBeenCalledWith({
      database,
      downloadId
    })
  })

  test('updates the database for progressing downloads', async () => {
    const downloadId = 'mock-download-id'
    const item = {
      getFilename: jest.fn().mockReturnValue('mock-filename.png'),
      getReceivedBytes: jest.fn().mockReturnValue(42),
      getTotalBytes: jest.fn().mockReturnValue(100),
      isPaused: jest.fn().mockReturnValue(false)
    }
    const state = 'progressing'
    const database = {
      getFileWhere: jest.fn().mockResolvedValue({
        id: 123
      }),
      updateFileById: jest.fn(),
      createPauseByDownloadIdAndFilename: jest.fn()
    }

    await onUpdated({
      database,
      downloadId,
      item,
      state
    })

    expect(database.getFileWhere).toHaveBeenCalledTimes(1)
    expect(database.getFileWhere).toHaveBeenCalledWith({
      downloadId: 'mock-download-id',
      filename: 'mock-filename.png'
    })

    expect(database.updateFileById).toHaveBeenCalledTimes(1)
    expect(database.updateFileById).toHaveBeenCalledWith(123, {
      percent: 42,
      state: downloadStates.active,
      receivedBytes: 42,
      totalBytes: 100
    })

    expect(database.createPauseByDownloadIdAndFilename).toHaveBeenCalledTimes(0)
  })

  test('updates the database for paused downloads', async () => {
    const downloadId = 'mock-download-id'
    const item = {
      getFilename: jest.fn().mockReturnValue('mock-filename.png'),
      getReceivedBytes: jest.fn().mockReturnValue(42),
      getTotalBytes: jest.fn().mockReturnValue(100),
      isPaused: jest.fn().mockReturnValue(true)
    }
    const state = 'progressing'
    const database = {
      getFileWhere: jest.fn().mockResolvedValue({
        id: 123
      }),
      updateFileById: jest.fn(),
      createPauseByDownloadIdAndFilename: jest.fn()
    }

    await onUpdated({
      database,
      downloadId,
      item,
      state
    })

    expect(database.getFileWhere).toHaveBeenCalledTimes(1)
    expect(database.getFileWhere).toHaveBeenCalledWith({
      downloadId: 'mock-download-id',
      filename: 'mock-filename.png'
    })

    expect(database.updateFileById).toHaveBeenCalledTimes(1)
    expect(database.updateFileById).toHaveBeenCalledWith(123, {
      percent: 42,
      state: downloadStates.paused,
      receivedBytes: 42,
      totalBytes: 100
    })

    expect(database.createPauseByDownloadIdAndFilename).toHaveBeenCalledTimes(0)
  })

  test('reports percent as 0 before total bytes are known', async () => {
    const downloadId = 'mock-download-id'
    const item = {
      getFilename: jest.fn().mockReturnValue('mock-filename.png'),
      getReceivedBytes: jest.fn().mockReturnValue(0),
      getTotalBytes: jest.fn().mockReturnValue(0),
      isPaused: jest.fn().mockReturnValue(false)
    }
    const state = 'progressing'
    const database = {
      getFileWhere: jest.fn().mockResolvedValue({
        id: 123
      }),
      updateFileById: jest.fn(),
      createPauseByDownloadIdAndFilename: jest.fn()
    }

    await onUpdated({
      database,
      downloadId,
      item,
      state
    })

    expect(database.getFileWhere).toHaveBeenCalledTimes(1)
    expect(database.getFileWhere).toHaveBeenCalledWith({
      downloadId: 'mock-download-id',
      filename: 'mock-filename.png'
    })

    expect(database.updateFileById).toHaveBeenCalledTimes(1)
    expect(database.updateFileById).toHaveBeenCalledWith(123, {
      percent: 0,
      receivedBytes: 0,
      state: downloadStates.active,
      totalBytes: 0
    })

    expect(database.createPauseByDownloadIdAndFilename).toHaveBeenCalledTimes(0)
  })

  test('cancels the item if the file is not in the database', async () => {
    const downloadId = 'mock-download-id'
    const item = {
      getFilename: jest.fn().mockReturnValue('mock-filename.png'),
      getReceivedBytes: jest.fn().mockReturnValue(42),
      getTotalBytes: jest.fn().mockReturnValue(100),
      cancel: jest.fn()
    }
    const state = 'progressing'
    const database = {
      getFileWhere: jest.fn().mockResolvedValue(undefined),
      updateFileById: jest.fn(),
      createPauseByDownloadIdAndFilename: jest.fn()
    }

    await onUpdated({
      database,
      downloadId,
      item,
      state
    })

    expect(database.getFileWhere).toHaveBeenCalledTimes(1)
    expect(database.getFileWhere).toHaveBeenCalledWith({
      downloadId: 'mock-download-id',
      filename: 'mock-filename.png'
    })

    expect(item.cancel).toHaveBeenCalledTimes(1)

    expect(database.updateFileById).toHaveBeenCalledTimes(0)
    expect(database.createPauseByDownloadIdAndFilename).toHaveBeenCalledTimes(0)
  })
})
