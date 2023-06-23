import MockDate from 'mockdate'

import startNextDownload from '../startNextDownload'

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
        id: 'mock-filename-1.png',
        downloadId,
        url: 'http://example.com/mock-filename-1.png',
        state: 'PENDING',
        percent: 0
      }]),
      getDownloadById: jest.fn().mockResolvedValue({
        downloadLocation: '/mock/download'
      }),
      getToken: jest.fn().mockResolvedValue({ token: 'mock-token' }),
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
      fileId: undefined,
      webContents
    })

    expect(database.getPreferences).toHaveBeenCalledTimes(1)
    expect(database.getToken).toHaveBeenCalledTimes(1)

    expect(database.getFilesToStart).toHaveBeenCalledTimes(1)
    expect(database.getFilesToStart).toHaveBeenCalledWith(1, undefined)

    expect(database.getDownloadById).toHaveBeenCalledTimes(1)
    expect(database.getDownloadById).toHaveBeenCalledWith('mock-download-id')

    expect(database.updateFile).toHaveBeenCalledTimes(1)
    expect(database.updateFile).toHaveBeenCalledWith('mock-filename-1.png', { state: 'STARTING' })

    expect(webContents.downloadURL).toHaveBeenCalledTimes(1)
    expect(webContents.downloadURL).toHaveBeenCalledWith(
      'http://example.com/mock-filename-1.png',
      { headers: { Authorization: 'Bearer mock-token' } }
    )

    expect(downloadIdContext).toEqual({
      'http://example.com/mock-filename-1.png': {
        downloadId: 'mock-download-id',
        downloadLocation: '/mock/download',
        fileId: 'mock-filename-1.png'
      }
    })
  })

  test('starts downloading the next file if a token does not exist', async () => {
    const downloadId = 'mock-download-id'
    const downloadIdContext = {}
    const database = {
      getPreferences: jest.fn().mockResolvedValue({ concurrentDownloads: 2 }),
      getFilesToStart: jest.fn().mockResolvedValue([{
        id: 'mock-filename-1.png',
        downloadId,
        url: 'http://example.com/mock-filename-1.png',
        state: 'PENDING',
        percent: 0
      }]),
      getDownloadById: jest.fn().mockResolvedValue({
        downloadLocation: '/mock/download'
      }),
      getToken: jest.fn().mockResolvedValue({ token: null }),
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
      fileId: undefined,
      webContents
    })

    expect(database.getPreferences).toHaveBeenCalledTimes(1)
    expect(database.getToken).toHaveBeenCalledTimes(1)

    expect(database.getFilesToStart).toHaveBeenCalledTimes(1)
    expect(database.getFilesToStart).toHaveBeenCalledWith(1, undefined)

    expect(database.getDownloadById).toHaveBeenCalledTimes(1)
    expect(database.getDownloadById).toHaveBeenCalledWith('mock-download-id')

    expect(database.updateFile).toHaveBeenCalledTimes(1)
    expect(database.updateFile).toHaveBeenCalledWith('mock-filename-1.png', { state: 'STARTING' })

    expect(webContents.downloadURL).toHaveBeenCalledTimes(1)
    expect(webContents.downloadURL).toHaveBeenCalledWith(
      'http://example.com/mock-filename-1.png',
      { headers: {} }
    )

    expect(downloadIdContext).toEqual({
      'http://example.com/mock-filename-1.png': {
        downloadId: 'mock-download-id',
        downloadLocation: '/mock/download',
        fileId: 'mock-filename-1.png'
      }
    })
  })

  test('starts downloading the next file when the fileId is provided', async () => {
    const downloadId = 'mock-download-id'
    const downloadIdContext = {}
    const database = {
      getPreferences: jest.fn().mockResolvedValue({ concurrentDownloads: 2 }),
      getFilesToStart: jest.fn().mockResolvedValue([{
        id: 'mock-filename-1.png',
        downloadId,
        url: 'http://example.com/mock-filename-1.png',
        state: 'PENDING',
        percent: 0
      }]),
      getDownloadById: jest.fn().mockResolvedValue({
        downloadLocation: '/mock/download'
      }),
      getToken: jest.fn().mockResolvedValue({ token: 'mock-token' }),
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
      fileId: 123,
      webContents
    })

    expect(database.getPreferences).toHaveBeenCalledTimes(1)
    expect(database.getToken).toHaveBeenCalledTimes(1)

    expect(database.getFilesToStart).toHaveBeenCalledTimes(1)
    expect(database.getFilesToStart).toHaveBeenCalledWith(1, 123)

    expect(database.getDownloadById).toHaveBeenCalledTimes(1)
    expect(database.getDownloadById).toHaveBeenCalledWith('mock-download-id')

    expect(database.updateFile).toHaveBeenCalledTimes(1)
    expect(database.updateFile).toHaveBeenCalledWith('mock-filename-1.png', { state: 'STARTING' })

    expect(webContents.downloadURL).toHaveBeenCalledTimes(1)
    expect(webContents.downloadURL).toHaveBeenCalledWith(
      'http://example.com/mock-filename-1.png',
      { headers: { Authorization: 'Bearer mock-token' } }
    )

    expect(downloadIdContext).toEqual({
      'http://example.com/mock-filename-1.png': {
        downloadId: 'mock-download-id',
        downloadLocation: '/mock/download',
        fileId: 'mock-filename-1.png'
      }
    })
  })

  test('starts downloading multiple files', async () => {
    const downloadId = 'mock-download-id'
    const downloadIdContext = {}
    const database = {
      getPreferences: jest.fn().mockResolvedValue({ concurrentDownloads: 2 }),
      getFilesToStart: jest.fn().mockResolvedValue([{
        id: 'mock-filename-1.png',
        downloadId,
        url: 'http://example.com/mock-filename-1.png',
        state: 'PENDING',
        percent: 0
      }, {
        id: 'mock-filename-2.png',
        downloadId: 'mock-download-id2',
        url: 'http://example.com/mock-filename-2.png',
        state: 'PENDING',
        percent: 0
      }]),
      getDownloadById: jest.fn()
        .mockResolvedValueOnce({
          downloadLocation: '/mock/download'
        })
        .mockResolvedValueOnce({
          downloadLocation: '/mock/download2'
        }),
      getToken: jest.fn().mockResolvedValue({ token: 'mock-token' }),
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
      fileId: undefined,
      webContents
    })

    expect(database.getPreferences).toHaveBeenCalledTimes(1)
    expect(database.getToken).toHaveBeenCalledTimes(1)

    expect(database.getFilesToStart).toHaveBeenCalledTimes(1)
    expect(database.getFilesToStart).toHaveBeenCalledWith(2, undefined)

    expect(database.getDownloadById).toHaveBeenCalledTimes(2)
    expect(database.getDownloadById).toHaveBeenCalledWith('mock-download-id')
    expect(database.getDownloadById).toHaveBeenCalledWith('mock-download-id2')

    expect(database.updateFile).toHaveBeenCalledTimes(2)
    expect(database.updateFile).toHaveBeenCalledWith('mock-filename-1.png', { state: 'STARTING' })
    expect(database.updateFile).toHaveBeenCalledWith('mock-filename-2.png', { state: 'STARTING' })

    expect(webContents.downloadURL).toHaveBeenCalledTimes(2)
    expect(webContents.downloadURL).toHaveBeenCalledWith(
      'http://example.com/mock-filename-1.png',
      { headers: { Authorization: 'Bearer mock-token' } }
    )
    expect(webContents.downloadURL).toHaveBeenCalledWith(
      'http://example.com/mock-filename-2.png',
      { headers: { Authorization: 'Bearer mock-token' } }
    )

    expect(downloadIdContext).toEqual({
      'http://example.com/mock-filename-1.png': {
        downloadId: 'mock-download-id',
        downloadLocation: '/mock/download',
        fileId: 'mock-filename-1.png'
      },
      'http://example.com/mock-filename-2.png': {
        downloadId: 'mock-download-id2',
        downloadLocation: '/mock/download2',
        fileId: 'mock-filename-2.png'
      }
    })
  })

  test('does not start downloading a file if the concurrentDownloads is met', async () => {
    const downloadIdContext = {}
    const database = {
      getPreferences: jest.fn().mockResolvedValue({ concurrentDownloads: 1 }),
      getFilesToStart: jest.fn(),
      getDownloadById: jest.fn(),
      getToken: jest.fn().mockResolvedValue({ token: 'mock-token' }),
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
      fileId: undefined,
      webContents
    })

    expect(database.getPreferences).toHaveBeenCalledTimes(1)
    expect(database.getToken).toHaveBeenCalledTimes(1)

    expect(database.getFilesToStart).toHaveBeenCalledTimes(0)
    expect(database.getDownloadById).toHaveBeenCalledTimes(0)
    expect(database.updateFile).toHaveBeenCalledTimes(0)

    expect(webContents.downloadURL).toHaveBeenCalledTimes(0)

    expect(downloadIdContext).toEqual({})
  })

  test('does not start downloading a file if no files need to be started', async () => {
    const downloadIdContext = {}
    const database = {
      getPreferences: jest.fn().mockResolvedValue({ concurrentDownloads: 1 }),
      getFilesToStart: jest.fn().mockResolvedValue([]),
      getDownloadById: jest.fn(),
      getToken: jest.fn().mockResolvedValue({ token: 'mock-token' }),
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
      fileId: undefined,
      webContents
    })

    expect(database.getPreferences).toHaveBeenCalledTimes(1)
    expect(database.getToken).toHaveBeenCalledTimes(1)

    expect(database.getFilesToStart).toHaveBeenCalledTimes(1)
    expect(database.getFilesToStart).toHaveBeenCalledWith(1, undefined)

    expect(database.getDownloadById).toHaveBeenCalledTimes(0)
    expect(database.updateFile).toHaveBeenCalledTimes(0)
    expect(database.updateFile).toHaveBeenCalledTimes(0)

    expect(webContents.downloadURL).toHaveBeenCalledTimes(0)

    expect(downloadIdContext).toEqual({})
  })
})
