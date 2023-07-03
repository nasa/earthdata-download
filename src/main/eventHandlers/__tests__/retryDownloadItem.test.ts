import retryDownloadItem from '../retryDownloadItem'

describe('retryDownloadItem', () => {
  describe('when downloadId and name are provided', () => {
    test('calls currentDownloadItems.cancelItem', async () => {
      const currentDownloadItems = {
        getItem: jest.fn().mockReturnValue({
          getURL: jest.fn()
        }),
        cancelItem: jest.fn()
      }
      const info = {
        downloadId: 'mock-download-id',
        name: 'mock-filename.png'
      }
      const database = {
        getDownloadById: jest.fn().mockResolvedValue({ numErrors: 1 }),
        getAllDownloads: jest.fn().mockResolvedValue([{
          id: 'mock-download-id',
          state: 'ERROR',
          files: {
            id: 'mock-filename.png',
            downloadId: 'mock-download-id',
            url: 'https://stsci-opo.org/STScI-01GHBZC0XR0DCJFZY0QXEH215V.png',
            state: 'ERROR',
            percent: 0
          },
          numErrors: 1
        }]),
        getFileWhere: jest.fn().mockResolvedValue({
          id: 'mock-filename.png',
          downloadId: 'mock-download-id',
          url: 'https://stsci-opo.org/STScI-01GHBZC0XR0DCJFZY0QXEH215V.png',
          state: 'ERROR',
          percent: 0
        }),
        deleteDownloadById: jest.fn(),
        deleteAllDownloads: jest.fn(),
        updateDownloadById: jest.fn(),
        updateFile: jest.fn(),
        deleteFile: jest.fn()
      }
      const downloadIdContext = {}
      const webContents = {
        downloadURL: jest.fn()
      }

      await retryDownloadItem({
        currentDownloadItems,
        database,
        downloadIdContext,
        info,
        webContents
      })

      expect(database.getAllDownloads).toHaveBeenCalledTimes(1)
      expect(database.getFileWhere).toHaveBeenCalledTimes(1)
      expect(database.getFileWhere).toHaveBeenCalledWith({
        filename: 'mock-filename.png',
        downloadId: 'mock-download-id'
      })

      expect(currentDownloadItems.getItem).toBeCalledTimes(1)
      expect(currentDownloadItems.cancelItem).toHaveBeenCalledTimes(1)
      expect(currentDownloadItems.cancelItem).toHaveBeenCalledWith('mock-download-id', 'mock-filename.png')

      expect(database.updateDownloadById).toHaveBeenCalledTimes(1)
      expect(database.updateDownloadById).toHaveBeenCalledWith('mock-download-id', { numErrors: 0 })

      expect(database.updateFile).toHaveBeenCalledTimes(1)
      expect(database.updateFile).toHaveBeenCalledWith({
        state: 'ACTIVE',
        errors: undefined,
        timeEnd: undefined
      })

      expect(downloadIdContext).toStrictEqual({ 'http://example.com/mock-filename.png': 'mock-download-id' })

      expect(webContents.downloadURL).toHaveBeenCalledTimes(1)
      expect(webContents.downloadURL).toHaveBeenCalledWith('http://example.com/mock-filename.png')
    })
  })

  describe('when only downloadId is provided', () => {
    test('calls currentDownloadItems.cancelItem and updates the database', async () => {
      const currentDownloadItems = {
        cancelItem: jest.fn()
      }
      const info = {
        downloadId: 'mock-download-id'
      }
      const database = {
        deleteDownloadById: jest.fn(),
        deleteAllDownloads: jest.fn(),
        updateDownloadById: jest.fn()
      }

      await cancelDownloadItem({
        currentDownloadItems,
        database,
        info
      })

      expect(currentDownloadItems.cancelItem).toHaveBeenCalledTimes(1)
      expect(currentDownloadItems.cancelItem).toHaveBeenCalledWith('mock-download-id', undefined)

      expect(database.updateDownloadById).toHaveBeenCalledTimes(1)
      expect(database.updateDownloadById).toHaveBeenCalledWith('mock-download-id', { state: 'COMPLETED' })

      expect(database.deleteDownloadById).toHaveBeenCalledTimes(1)
      expect(database.deleteDownloadById).toHaveBeenCalledWith('mock-download-id')

      expect(database.deleteAllDownloads).toHaveBeenCalledTimes(0)
    })
  })

  describe('when no downloadId or name is provided', () => {
    test('calls currentDownloadItems.cancelItem and updates the database', async () => {
      const currentDownloadItems = {
        cancelItem: jest.fn()
      }
      const info = {}
      const database = {
        deleteDownloadById: jest.fn(),
        deleteAllDownloads: jest.fn(),
        updateDownloadById: jest.fn()
      }

      await cancelDownloadItem({
        currentDownloadItems,
        database,
        info
      })

      expect(currentDownloadItems.cancelItem).toHaveBeenCalledTimes(1)
      expect(currentDownloadItems.cancelItem).toHaveBeenCalledWith(undefined, undefined)

      expect(database.updateDownloadById).toHaveBeenCalledTimes(0)

      expect(database.deleteDownloadById).toHaveBeenCalledTimes(0)

      expect(database.deleteAllDownloads).toHaveBeenCalledTimes(1)
    })
  })
})
