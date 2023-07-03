import MockDate from 'mockdate'

import onDone from '../onDone'
import startNextDownload from '../../../utils/startNextDownload'
import finishDownload from '../finishDownload'

jest.mock('../../../utils/startNextDownload', () => ({
  __esModule: true,
  default: jest.fn(() => {})
}))

jest.mock('../finishDownload', () => ({
  __esModule: true,
  default: jest.fn(() => { })
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
      getDownloadById: jest.fn().mockResolvedValue({ numErrors: 0 }),
      updateDownloadById: jest.fn(),
      getFileWhere: jest.fn().mockResolvedValue({
        id: 123
      }),
      updateFile: jest.fn()
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

    expect(database.updateFile).toHaveBeenCalledTimes(1)
    expect(database.updateFile).toHaveBeenCalledWith(123, {
      percent: 100,
      state: 'COMPLETED',
      timeEnd: 1684029600000
    })

    expect(startNextDownload).toHaveBeenCalledTimes(1)
    expect(startNextDownload).toHaveBeenCalledWith({
      currentDownloadItems,
      database,
      downloadId: 'mock-download-id',
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
      getDownloadById: jest.fn().mockResolvedValue({ numErrors: 0 }),
      updateDownloadById: jest.fn(),
      getFileWhere: jest.fn().mockResolvedValue({
        id: 123
      }),
      updateFile: jest.fn()
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

    // expect(store.set).toHaveBeenCalledTimes(2)
    // expect(store.set).toHaveBeenCalledWith('downloads.mock-download-id', {
    //   downloadLocation: '/mock/location/mock-download-id-20230514_012554',
    //   timeStart: 1684027555379,
    //   files: {
    //     'mock-filename.png': {
    //       url: 'http://example.com/mock-filename.png',
    //       state: 'ACTIVE',
    //       percent: 0,
    //       timeStart: 1684029600000,
    //       timeEnd: 1684029600000
    //     }
    //   },
    //   state: 'ACTIVE',
    //   numErrors: 1

    expect(database.getFileWhere).toHaveBeenCalledTimes(1)
    expect(database.getFileWhere).toHaveBeenCalledWith({
      downloadId: 'mock-download-id',
      filename: 'mock-filename.png'
    })

    expect(database.updateFile).toHaveBeenCalledTimes(1)
    expect(database.updateFile).toHaveBeenCalledWith(123, {
      errors: undefined,
      percent: 0,
      state: 'ERROR',
      timeEnd: 1684029600000
    })

    expect(startNextDownload).toHaveBeenCalledTimes(1)
    expect(startNextDownload).toHaveBeenCalledWith({
      currentDownloadItems,
      database,
      downloadId: 'mock-download-id',
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
      getDownloadById: jest.fn().mockResolvedValue({ numErrors: 0 }),
      updateDownloadById: jest.fn(),
      getFileWhere: jest.fn().mockResolvedValue({
        id: 123
      }),
      updateFile: jest.fn()
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

    expect(database.updateFile).toHaveBeenCalledTimes(1)
    expect(database.updateFile).toHaveBeenCalledWith(123, {
      errors: undefined,
      percent: 0,
      state: 'PENDING',
      timeEnd: 1684029600000
    })

    expect(startNextDownload).toHaveBeenCalledTimes(1)
    expect(startNextDownload).toHaveBeenCalledWith({
      currentDownloadItems,
      downloadId: 'mock-download-id',
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
      getDownloadById: jest.fn().mockResolvedValue({ numErrors: 0 }),
      getFileWhere: jest.fn().mockResolvedValue(undefined),
      updateFile: jest.fn(),
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

    expect(database.updateFile).toHaveBeenCalledTimes(0)
    expect(database.updateDownloadById).toHaveBeenCalledTimes(0)

    expect(startNextDownload).toHaveBeenCalledTimes(0)
    expect(finishDownload).toHaveBeenCalledTimes(0)
  })
})
