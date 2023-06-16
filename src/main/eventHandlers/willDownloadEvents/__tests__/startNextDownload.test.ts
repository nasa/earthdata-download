import MockDate from 'mockdate'

import startNextDownload from '../startNextDownload'

beforeEach(() => {
  MockDate.set('2023-05-13T22:00:00')
})

describe('startNextDownload', () => {
  test('starts downloading the next file in the next active download', async () => {
    const downloadId = 'mock-download-id'
    const downloadIdContext = {}
    const database = {
      getPreferences: jest.fn().mockResolvedValue({ concurrentDownloads: 2 }),
      getDownloadsWhere: jest.fn().mockResolvedValue([{
        id: downloadId,
        downloadLocation: '/mock/download',
        state: 'ACTIVE'
      }]),
      getFilesWhere: jest.fn().mockResolvedValue([{
        id: 'mock-filename-1.png',
        downloadId,
        url: 'http://example.com/mock-filename-1.png',
        state: 'PENDING',
        percent: 0
      }]),
      getNotCompletedFilesByDownloadId: jest.fn().mockResolvedValue([]),
      updateDownloadById: jest.fn(),
      updateFile: jest.fn()
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
      webContents
    })

    expect(database.getPreferences).toHaveBeenCalledTimes(1)

    expect(database.getDownloadsWhere).toHaveBeenCalledTimes(1)
    expect(database.getDownloadsWhere).toHaveBeenCalledWith({ state: 'ACTIVE' })

    expect(database.getFilesWhere).toHaveBeenCalledTimes(1)
    expect(database.getFilesWhere).toHaveBeenCalledWith({
      downloadId: 'mock-download-id',
      state: 'PENDING'
    })

    expect(database.updateDownloadById).toHaveBeenCalledTimes(0)

    expect(database.updateFile).toHaveBeenCalledTimes(1)
    expect(database.updateFile).toHaveBeenCalledWith('mock-filename-1.png', { state: 'STARTING' })

    expect(webContents.downloadURL).toHaveBeenCalledTimes(1)
    expect(webContents.downloadURL).toHaveBeenCalledWith('http://example.com/mock-filename-1.png')

    expect(downloadIdContext).toEqual({
      'http://example.com/mock-filename-1.png': {
        downloadId: 'mock-download-id',
        downloadLocation: '/mock/download',
        fileId: 'mock-filename-1.png'
      }
    })
  })

  test('starts downloading multiple files in the next active download', async () => {
    const downloadId = 'mock-download-id'
    const downloadIdContext = {}
    const database = {
      getPreferences: jest.fn().mockResolvedValue({ concurrentDownloads: 2 }),
      getDownloadsWhere: jest.fn().mockResolvedValue([{
        id: downloadId,
        state: 'ACTIVE'
      }]),
      getFilesWhere: jest.fn()
        .mockResolvedValueOnce([{
          id: 'mock-filename-1.png',
          downloadId,
          url: 'http://example.com/mock-filename-1.png',
          state: 'PENDING',
          percent: 0
        }, {
          id: 'mock-filename-2.png',
          downloadId,
          url: 'http://example.com/mock-filename-1.png',
          state: 'PENDING',
          percent: 0
        }])
        .mockResolvedValueOnce([{
          id: 'mock-filename-2.png',
          downloadId,
          url: 'http://example.com/mock-filename-2.png',
          state: 'PENDING',
          percent: 0
        }]),
      getNotCompletedFilesByDownloadId: jest.fn().mockResolvedValue([]),
      updateDownloadById: jest.fn(),
      updateFile: jest.fn()
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
      webContents
    })

    expect(database.getPreferences).toHaveBeenCalledTimes(1)

    expect(database.getDownloadsWhere).toHaveBeenCalledTimes(2)
    expect(database.getDownloadsWhere).toHaveBeenCalledWith({ state: 'ACTIVE' })

    expect(database.getFilesWhere).toHaveBeenCalledTimes(2)
    expect(database.getFilesWhere).toHaveBeenCalledWith({
      downloadId: 'mock-download-id',
      state: 'PENDING'
    })

    expect(database.updateDownloadById).toHaveBeenCalledTimes(0)

    expect(database.updateFile).toHaveBeenCalledTimes(2)
    expect(database.updateFile).toHaveBeenCalledWith('mock-filename-1.png', { state: 'STARTING' })
    expect(database.updateFile).toHaveBeenCalledWith('mock-filename-2.png', { state: 'STARTING' })

    expect(webContents.downloadURL).toHaveBeenCalledTimes(2)
    expect(webContents.downloadURL).toHaveBeenCalledWith('http://example.com/mock-filename-1.png')
    expect(webContents.downloadURL).toHaveBeenCalledWith('http://example.com/mock-filename-2.png')

    expect(downloadIdContext).toEqual({
      'http://example.com/mock-filename-1.png': {
        downloadId: 'mock-download-id',
        downloadLocation: undefined,
        fileId: 'mock-filename-1.png'
      },
      'http://example.com/mock-filename-2.png': {
        downloadId: 'mock-download-id',
        downloadLocation: undefined,
        fileId: 'mock-filename-2.png'
      }
    })
  })

  test('starts downloading multiple files across active downloads', async () => {
    const downloadId1 = 'mock-download-id-1'
    const downloadId2 = 'mock-download-id-2'
    const downloadIdContext = {}
    const database = {
      getPreferences: jest.fn().mockResolvedValue({ concurrentDownloads: 2 }),
      getDownloadsWhere: jest.fn().mockResolvedValue([{
        id: downloadId1,
        downloadLocation: '/mock/download',
        state: 'ACTIVE'
      }, {
        id: downloadId2,
        downloadLocation: '/mock/download',
        state: 'ACTIVE'
      }]),
      getFilesWhere: jest.fn()
        // First time it returns 1 pending file for downloadId1
        .mockResolvedValueOnce([{
          id: 'mock-filename-1.png',
          downloadId: downloadId1,
          url: 'http://example.com/mock-filename-1.png',
          state: 'PENDING',
          percent: 0
        }])
        // Second time it returns 0 pending file for downloadId1
        .mockResolvedValueOnce([])
        // Third time it returns 1 pending file for downloadId2
        .mockResolvedValueOnce([{
          id: 'mock-filename-2.png',
          downloadId: downloadId2,
          url: 'http://example.com/mock-filename-2.png',
          state: 'PENDING',
          percent: 0
        }]),
      getNotCompletedFilesByDownloadId: jest.fn().mockResolvedValue([{
        id: 'mock-filename-1.png',
        downloadId: downloadId1,
        url: 'http://example.com/mock-filename-1.png',
        state: 'ACTIVE',
        percent: 1
      }]),
      updateDownloadById: jest.fn(),
      updateFile: jest.fn()
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
      webContents
    })

    expect(database.getPreferences).toHaveBeenCalledTimes(1)

    expect(database.getDownloadsWhere).toHaveBeenCalledTimes(2)
    expect(database.getDownloadsWhere).toHaveBeenCalledWith({ state: 'ACTIVE' })

    expect(database.getFilesWhere).toHaveBeenCalledTimes(3)
    expect(database.getFilesWhere).toHaveBeenCalledWith({
      downloadId: 'mock-download-id-1',
      state: 'PENDING'
    })
    expect(database.getFilesWhere).toHaveBeenCalledWith({
      downloadId: 'mock-download-id-1',
      state: 'PENDING'
    })
    expect(database.getFilesWhere).toHaveBeenCalledWith({
      downloadId: 'mock-download-id-2',
      state: 'PENDING'
    })

    expect(database.updateDownloadById).toHaveBeenCalledTimes(0)

    expect(database.updateFile).toHaveBeenCalledTimes(2)
    expect(database.updateFile).toHaveBeenCalledWith('mock-filename-1.png', { state: 'STARTING' })
    expect(database.updateFile).toHaveBeenCalledWith('mock-filename-2.png', { state: 'STARTING' })

    expect(webContents.downloadURL).toHaveBeenCalledTimes(2)
    expect(webContents.downloadURL).toHaveBeenCalledWith('http://example.com/mock-filename-1.png')
    expect(webContents.downloadURL).toHaveBeenCalledWith('http://example.com/mock-filename-2.png')

    expect(downloadIdContext).toEqual({
      'http://example.com/mock-filename-1.png': {
        downloadId: 'mock-download-id-1',
        downloadLocation: '/mock/download',
        fileId: 'mock-filename-1.png'
      },
      'http://example.com/mock-filename-2.png': {
        downloadId: 'mock-download-id-2',
        downloadLocation: '/mock/download',
        fileId: 'mock-filename-2.png'
      }
    })
  })

  test('sets the timeEnd on the download if all the files are completed', async () => {
    const downloadId = 'mock-download-id'
    const downloadIdContext = {}
    const database = {
      getPreferences: jest.fn().mockResolvedValue({ concurrentDownloads: 1 }),
      getDownloadsWhere: jest.fn().mockResolvedValue([{
        id: downloadId,
        state: 'ACTIVE'
      }]),
      getFilesWhere: jest.fn().mockResolvedValue([]),
      getNotCompletedFilesByDownloadId: jest.fn().mockResolvedValue([]),
      updateDownloadById: jest.fn(),
      updateFile: jest.fn()
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
      webContents
    })

    expect(database.getPreferences).toHaveBeenCalledTimes(1)

    expect(database.getDownloadsWhere).toHaveBeenCalledTimes(1)
    expect(database.getDownloadsWhere).toHaveBeenCalledWith({ state: 'ACTIVE' })

    expect(database.getFilesWhere).toHaveBeenCalledTimes(1)
    expect(database.getFilesWhere).toHaveBeenCalledWith({
      downloadId: 'mock-download-id',
      state: 'PENDING'
    })

    expect(database.getNotCompletedFilesByDownloadId).toHaveBeenCalledTimes(1)
    expect(database.getNotCompletedFilesByDownloadId).toHaveBeenCalledWith(downloadId)

    expect(database.updateDownloadById).toHaveBeenCalledTimes(1)
    expect(database.updateDownloadById).toHaveBeenCalledWith('mock-download-id', {
      state: 'COMPLETED',
      timeEnd: 1684029600000
    })

    expect(database.updateFile).toHaveBeenCalledTimes(0)

    expect(webContents.downloadURL).toHaveBeenCalledTimes(0)

    expect(downloadIdContext).toEqual({})
  })

  test('does not start downloading a file if the concurrentDownloads is met', async () => {
    const downloadId = 'mock-download-id'
    const downloadIdContext = {}
    const database = {
      getPreferences: jest.fn().mockResolvedValue({ concurrentDownloads: 1 }),
      getDownloadsWhere: jest.fn().mockResolvedValue([{
        id: downloadId,
        state: 'ACTIVE'
      }]),
      getFilesWhere: jest.fn().mockResolvedValue([]),
      getNotCompletedFilesByDownloadId: jest.fn().mockResolvedValue([{
        state: 'ACTIVE'
      }]),
      updateDownloadById: jest.fn(),
      updateFile: jest.fn()
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
      webContents
    })

    expect(database.getPreferences).toHaveBeenCalledTimes(1)

    expect(database.getDownloadsWhere).toHaveBeenCalledTimes(0)
    expect(database.getFilesWhere).toHaveBeenCalledTimes(0)
    expect(database.getNotCompletedFilesByDownloadId).toHaveBeenCalledTimes(0)
    expect(database.updateDownloadById).toHaveBeenCalledTimes(0)
    expect(database.updateFile).toHaveBeenCalledTimes(0)

    expect(webContents.downloadURL).toHaveBeenCalledTimes(0)

    expect(downloadIdContext).toEqual({})
  })

  test('does not start downloading a file if there are no active downloads', async () => {
    const downloadIdContext = {}
    const database = {
      getPreferences: jest.fn().mockResolvedValue({ concurrentDownloads: 1 }),
      getDownloadsWhere: jest.fn().mockResolvedValue([]),
      getFilesWhere: jest.fn().mockResolvedValue([]),
      getNotCompletedFilesByDownloadId: jest.fn().mockResolvedValue([]),
      updateDownloadById: jest.fn(),
      updateFile: jest.fn()
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
      webContents
    })

    expect(database.getPreferences).toHaveBeenCalledTimes(1)

    expect(database.getDownloadsWhere).toHaveBeenCalledTimes(1)
    expect(database.getDownloadsWhere).toHaveBeenCalledWith({ state: 'ACTIVE' })

    expect(database.getFilesWhere).toHaveBeenCalledTimes(0)
    expect(database.getNotCompletedFilesByDownloadId).toHaveBeenCalledTimes(0)
    expect(database.updateDownloadById).toHaveBeenCalledTimes(0)
    expect(database.updateFile).toHaveBeenCalledTimes(0)

    expect(webContents.downloadURL).toHaveBeenCalledTimes(0)

    expect(downloadIdContext).toEqual({})
  })

  test('does not start downloading a file if no files need to be started', async () => {
    const downloadId = 'mock-download-id'
    const downloadIdContext = {}
    const database = {
      getPreferences: jest.fn().mockResolvedValue({ concurrentDownloads: 1 }),
      getDownloadsWhere: jest.fn().mockResolvedValue([{
        id: downloadId,
        state: 'ACTIVE'
      }]),
      getFilesWhere: jest.fn().mockResolvedValue([]),
      getNotCompletedFilesByDownloadId: jest.fn().mockResolvedValue([{
        state: 'ACTIVE'
      }]),
      updateDownloadById: jest.fn(),
      updateFile: jest.fn()
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
      webContents
    })

    expect(database.getPreferences).toHaveBeenCalledTimes(1)

    expect(database.getDownloadsWhere).toHaveBeenCalledTimes(1)
    expect(database.getDownloadsWhere).toHaveBeenCalledWith({ state: 'ACTIVE' })

    expect(database.getFilesWhere).toHaveBeenCalledTimes(1)
    expect(database.getFilesWhere).toHaveBeenCalledWith({
      downloadId: 'mock-download-id',
      state: 'PENDING'
    })

    expect(database.getNotCompletedFilesByDownloadId).toHaveBeenCalledTimes(1)
    expect(database.getNotCompletedFilesByDownloadId).toHaveBeenCalledWith('mock-download-id')

    expect(database.updateDownloadById).toHaveBeenCalledTimes(0)
    expect(database.updateFile).toHaveBeenCalledTimes(0)

    expect(webContents.downloadURL).toHaveBeenCalledTimes(0)

    expect(downloadIdContext).toEqual({})
  })
})
