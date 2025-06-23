// @ts-nocheck

import MockDate from 'mockdate'

import metricsLogger from '../../../utils/metricsLogger'
import downloadIdForMetrics from '../../../utils/downloadIdForMetrics'
import onDone from '../onDone'
import startNextDownload from '../../../utils/startNextDownload'
import finishDownload from '../finishDownload'

import downloadStates from '../../../../app/constants/downloadStates'
import metricsEvent from '../../../../app/constants/metricsEvent'

jest.mock('../../../utils/startNextDownload', () => ({
  __esModule: true,
  default: jest.fn(() => {})
}))

jest.mock('../finishDownload', () => ({
  __esModule: true,
  default: jest.fn(() => { })
}))

jest.mock('../../../utils/metricsLogger', () => ({
  __esModule: true,
  default: jest.fn(() => {})
}))

beforeEach(() => {
  MockDate.set('2023-05-13T22:00:00.000')
})

describe('onDone', () => {
  test('updates the database and calls startNextDownload for a completed download', async () => {
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
    const database = {
      getDownloadById: jest.fn().mockResolvedValue({ errors: [] }),
      updateDownloadById: jest.fn(),
      getFileWhere: jest.fn().mockResolvedValue({
        id: 123,
        state: downloadStates.active
      }),
      updateFileById: jest.fn()
    }

    await onDone({
      currentDownloadItems,
      database,
      downloadId,
      downloadIdContext: {},
      item,
      state,
      webContents: {}
    })

    expect(currentDownloadItems.removeItem).toHaveBeenCalledTimes(1)
    expect(currentDownloadItems.removeItem).toHaveBeenCalledWith('mock-download-id', 'mock-filename.png')

    expect(database.getFileWhere).toHaveBeenCalledTimes(1)
    expect(database.getFileWhere).toHaveBeenCalledWith({
      downloadId: 'mock-download-id',
      filename: 'mock-filename.png'
    })

    expect(database.updateFileById).toHaveBeenCalledTimes(1)
    expect(database.updateFileById).toHaveBeenCalledWith(123, {
      cancelId: null,
      percent: 100,
      state: downloadStates.completed,
      timeEnd: 1684029600000
    })

    expect(startNextDownload).toHaveBeenCalledTimes(1)
    expect(startNextDownload).toHaveBeenCalledWith({
      currentDownloadItems,
      database,
      downloadIdContext: {},
      webContents: {}
    })

    expect(finishDownload).toHaveBeenCalledTimes(1)
    expect(finishDownload).toHaveBeenCalledWith({
      database,
      downloadId: 'mock-download-id'
    })
  })

  test('updates the database and calls startNextDownload for an interrupted download', async () => {
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
    const database = {
      getDownloadById: jest.fn().mockResolvedValue({ errors: [] }),
      updateDownloadById: jest.fn(),
      getFileWhere: jest.fn().mockResolvedValue({
        id: 123,
        state: downloadStates.active
      }),
      updateFileById: jest.fn()
    }

    await onDone({
      currentDownloadItems,
      database,
      downloadId,
      downloadIdContext: {},
      item,
      state,
      webContents: {}
    })

    expect(metricsLogger).toHaveBeenCalledTimes(1)
    expect(metricsLogger).toHaveBeenCalledWith(database, {
      eventType: metricsEvent.downloadErrored,
      data: {
        downloadId: downloadIdForMetrics(downloadId),
        filename: 'mock-filename.png'
      }
    })

    expect(database.getFileWhere).toHaveBeenCalledTimes(1)
    expect(database.getFileWhere).toHaveBeenCalledWith({
      downloadId: 'mock-download-id',
      filename: 'mock-filename.png'
    })

    expect(database.updateFileById).toHaveBeenCalledTimes(1)
    expect(database.updateFileById).toHaveBeenCalledWith(123, {
      cancelId: null,
      errors: 'This file could not be downloaded',
      percent: 0,
      state: downloadStates.error,
      timeEnd: 1684029600000
    })

    expect(startNextDownload).toHaveBeenCalledTimes(1)
    expect(startNextDownload).toHaveBeenCalledWith({
      currentDownloadItems,
      database,
      downloadIdContext: {},
      webContents: {}
    })

    expect(finishDownload).toHaveBeenCalledTimes(1)
    expect(finishDownload).toHaveBeenCalledWith({
      database,
      downloadId: 'mock-download-id'
    })
  })

  test('updates the database and calls startNextDownload for a cancelled download', async () => {
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
    const database = {
      getDownloadById: jest.fn().mockResolvedValue({
        errors: []
      }),
      updateDownloadById: jest.fn(),
      getFileWhere: jest.fn().mockResolvedValue({
        id: 123,
        state: downloadStates.active
      }),
      updateFileById: jest.fn()
    }

    await onDone({
      currentDownloadItems,
      database,
      downloadId,
      downloadIdContext: {},
      item,
      state,
      webContents: {}
    })

    expect(currentDownloadItems.removeItem).toHaveBeenCalledTimes(1)
    expect(currentDownloadItems.removeItem).toHaveBeenCalledWith('mock-download-id', 'mock-filename.png')

    expect(database.getFileWhere).toHaveBeenCalledTimes(1)
    expect(database.getFileWhere).toHaveBeenCalledWith({
      downloadId: 'mock-download-id',
      filename: 'mock-filename.png'
    })

    expect(database.updateFileById).toHaveBeenCalledTimes(1)
    expect(database.updateFileById).toHaveBeenCalledWith(123, {
      cancelId: null,
      errors: undefined,
      percent: 0,
      state: downloadStates.cancelled,
      timeEnd: 1684029600000
    })

    expect(startNextDownload).toHaveBeenCalledTimes(1)
    expect(startNextDownload).toHaveBeenCalledWith({
      currentDownloadItems,
      downloadIdContext: {},
      database,
      webContents: {}
    })

    expect(finishDownload).toHaveBeenCalledTimes(1)
    expect(finishDownload).toHaveBeenCalledWith({
      database,
      downloadId: 'mock-download-id'
    })
  })

  test('does not set a cancelled file to cancelled when the download state is appQuitting', async () => {
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
    const database = {
      getDownloadById: jest.fn().mockResolvedValue({
        errors: [],
        state: downloadStates.appQuitting
      }),
      updateDownloadById: jest.fn(),
      getFileWhere: jest.fn().mockResolvedValue({
        id: 123,
        state: downloadStates.active
      }),
      updateFileById: jest.fn()
    }

    await onDone({
      currentDownloadItems,
      database,
      downloadId,
      downloadIdContext: {},
      item,
      state,
      webContents: {}
    })

    expect(currentDownloadItems.removeItem).toHaveBeenCalledTimes(1)
    expect(currentDownloadItems.removeItem).toHaveBeenCalledWith('mock-download-id', 'mock-filename.png')

    expect(database.getFileWhere).toHaveBeenCalledTimes(1)
    expect(database.getFileWhere).toHaveBeenCalledWith({
      downloadId: 'mock-download-id',
      filename: 'mock-filename.png'
    })

    expect(database.updateFileById).toHaveBeenCalledTimes(1)
    expect(database.updateFileById).toHaveBeenCalledWith(123, {
      cancelId: null,
      errors: undefined,
      percent: 0,
      state: downloadStates.active,
      timeEnd: 1684029600000
    })

    expect(startNextDownload).toHaveBeenCalledTimes(1)
    expect(startNextDownload).toHaveBeenCalledWith({
      currentDownloadItems,
      downloadIdContext: {},
      database,
      webContents: {}
    })

    expect(finishDownload).toHaveBeenCalledTimes(1)
    expect(finishDownload).toHaveBeenCalledWith({
      database,
      downloadId: 'mock-download-id'
    })
  })

  test('does not set a cancelled file to cancelled when the file state is not active', async () => {
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
    const database = {
      getDownloadById: jest.fn().mockResolvedValue({
        errors: [],
        state: downloadStates.active
      }),
      updateDownloadById: jest.fn(),
      getFileWhere: jest.fn().mockResolvedValue({
        id: 123,
        state: downloadStates.error
      }),
      updateFileById: jest.fn()
    }

    await onDone({
      currentDownloadItems,
      database,
      downloadId,
      downloadIdContext: {},
      item,
      state,
      webContents: {}
    })

    expect(currentDownloadItems.removeItem).toHaveBeenCalledTimes(1)
    expect(currentDownloadItems.removeItem).toHaveBeenCalledWith('mock-download-id', 'mock-filename.png')

    expect(database.getFileWhere).toHaveBeenCalledTimes(1)
    expect(database.getFileWhere).toHaveBeenCalledWith({
      downloadId: 'mock-download-id',
      filename: 'mock-filename.png'
    })

    expect(database.updateFileById).toHaveBeenCalledTimes(0)

    expect(startNextDownload).toHaveBeenCalledTimes(1)
    expect(startNextDownload).toHaveBeenCalledWith({
      currentDownloadItems,
      downloadIdContext: {},
      database,
      webContents: {}
    })

    expect(finishDownload).toHaveBeenCalledTimes(1)
    expect(finishDownload).toHaveBeenCalledWith({
      database,
      downloadId: 'mock-download-id'
    })
  })

  test('does not update the database if the file is not in the database', async () => {
    const currentDownloadItems = {
      removeItem: jest.fn()
    }
    const downloadId = 'mock-download-id'
    const item = {
      getFilename: jest.fn().mockReturnValue('mock-filename.png'),
      getReceivedBytes: jest.fn().mockReturnValue(42),
      getTotalBytes: jest.fn().mockReturnValue(100),
      cancel: jest.fn()
    }
    const state = 'progressing'
    const database = {
      getDownloadById: jest.fn().mockResolvedValue({ errors: [] }),
      getFileWhere: jest.fn().mockResolvedValue(undefined),
      updateFileById: jest.fn(),
      updateDownloadById: jest.fn()
    }

    await onDone({
      currentDownloadItems,
      database,
      downloadId,
      downloadIdContext: {},
      item,
      state,
      webContents: {}
    })

    expect(database.getFileWhere).toHaveBeenCalledTimes(1)
    expect(database.getFileWhere).toHaveBeenCalledWith({
      downloadId: 'mock-download-id',
      filename: 'mock-filename.png'
    })

    expect(database.updateFileById).toHaveBeenCalledTimes(0)
    expect(database.updateDownloadById).toHaveBeenCalledTimes(0)

    expect(startNextDownload).toHaveBeenCalledTimes(0)
    expect(finishDownload).toHaveBeenCalledTimes(0)
  })
})
