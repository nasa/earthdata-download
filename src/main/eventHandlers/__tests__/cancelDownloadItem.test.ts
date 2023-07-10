import cancelDownloadItem from '../cancelDownloadItem'

describe('cancelDownloadItem', () => {
  describe('when downloadId and name are provided', () => {
    test('calls currentDownloadItems.cancelItem', async () => {
      const currentDownloadItems = {
        cancelItem: jest.fn()
      }
      const info = {
        downloadId: 'mock-download-id',
        name: 'mock-filename.png'
      }
      const database = {
        getDownloadById: jest.fn().mockResolvedValue({ numErrors: 1 }),
        deleteDownloadById: jest.fn(),
        deleteAllDownloads: jest.fn(),
        updateDownloadById: jest.fn(),
        deleteFile: jest.fn()
      }

      await cancelDownloadItem({
        currentDownloadItems,
        database,
        info
      })

      expect(currentDownloadItems.cancelItem).toHaveBeenCalledTimes(1)
      expect(currentDownloadItems.cancelItem).toHaveBeenCalledWith('mock-download-id', 'mock-filename.png')

      expect(database.updateDownloadById).toHaveBeenCalledTimes(1)
      expect(database.updateDownloadById).toHaveBeenCalledWith('mock-download-id', { state: 'COMPLETED' })

      expect(database.deleteDownloadById).toHaveBeenCalledTimes(0)
      expect(database.deleteAllDownloads).toHaveBeenCalledTimes(0)
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
