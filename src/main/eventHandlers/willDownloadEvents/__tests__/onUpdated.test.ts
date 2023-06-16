import MockDate from 'mockdate'

import onUpdated from '../onUpdated'

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
      updateFile: jest.fn(),
      updateDownloadById: jest.fn()
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

    expect(database.updateFile).toHaveBeenCalledTimes(1)
    expect(database.updateFile).toHaveBeenCalledWith(123, {
      percent: 42,
      state: 'INTERRUPTED'
    })

    expect(database.updateDownloadById).toHaveBeenCalledTimes(1)
    expect(database.updateDownloadById).toHaveBeenCalledWith('mock-download-id', {
      state: 'INTERRUPTED'
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
      updateFile: jest.fn(),
      updateDownloadById: jest.fn()
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

    expect(database.updateFile).toHaveBeenCalledTimes(1)
    expect(database.updateFile).toHaveBeenCalledWith(123, {
      percent: 42,
      state: 'ACTIVE'
    })

    expect(database.updateDownloadById).toHaveBeenCalledTimes(0)
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
      updateFile: jest.fn(),
      updateDownloadById: jest.fn()
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

    expect(database.updateFile).toHaveBeenCalledTimes(1)
    expect(database.updateFile).toHaveBeenCalledWith(123, {
      percent: 42,
      state: 'PAUSED'
    })

    expect(database.updateDownloadById).toHaveBeenCalledTimes(0)
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
      updateFile: jest.fn(),
      updateDownloadById: jest.fn()
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

    expect(database.updateFile).toHaveBeenCalledTimes(1)
    expect(database.updateFile).toHaveBeenCalledWith(123, {
      percent: 0,
      state: 'ACTIVE'
    })

    expect(database.updateDownloadById).toHaveBeenCalledTimes(0)
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
      updateFile: jest.fn(),
      updateDownloadById: jest.fn()
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

    expect(database.updateFile).toHaveBeenCalledTimes(0)
    expect(database.updateDownloadById).toHaveBeenCalledTimes(0)
  })
})
