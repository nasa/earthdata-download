import undoCancellingDownload from '../undoCancellingDownload'

describe('undoCancellingDownload', () => {
  describe('when a downloadId is provided', () => {
    test('updates the database', async () => {
      const currentDownloadItems = {
        resumeItem: jest.fn()
      }
      const info = {
        cancelId: 'mock-delete-id',
        downloadId: 'mock-download-id'
      }
      const database = {
        endPause: jest.fn(),
        updateDownloadsWhere: jest.fn(),
        updateFilesWhere: jest.fn()
      }

      await undoCancellingDownload({
        currentDownloadItems,
        database,
        info
      })

      expect(currentDownloadItems.resumeItem).toHaveBeenCalledTimes(1)
      expect(currentDownloadItems.resumeItem).toHaveBeenCalledWith('mock-download-id', undefined)

      expect(database.endPause).toHaveBeenCalledTimes(1)
      expect(database.endPause).toHaveBeenCalledWith('mock-download-id', undefined)

      expect(database.updateDownloadsWhere).toHaveBeenCalledTimes(1)
      expect(database.updateDownloadsWhere).toHaveBeenCalledWith({
        cancelId: 'mock-delete-id'
      }, {
        cancelId: null
      })

      expect(database.updateFilesWhere).toHaveBeenCalledTimes(1)
      expect(database.updateFilesWhere).toHaveBeenCalledWith({
        cancelId: 'mock-delete-id'
      }, {
        cancelId: null
      })
    })
  })

  describe('when a downloadId is not provided', () => {
    test('updates the database', async () => {
      const currentDownloadItems = {
        resumeItem: jest.fn()
      }
      const info = {
        cancelId: 'mock-delete-id'
      }
      const database = {
        endPause: jest.fn(),
        getAllDownloadsWhere: jest.fn()
          .mockResolvedValue([{
            id: 42
          }, {
            id: 43
          }]),
        updateDownloadsWhere: jest.fn(),
        updateFilesWhere: jest.fn()
      }

      await undoCancellingDownload({
        currentDownloadItems,
        database,
        info
      })

      expect(currentDownloadItems.resumeItem).toHaveBeenCalledTimes(1)
      expect(currentDownloadItems.resumeItem).toHaveBeenCalledWith(undefined, undefined)

      expect(database.getAllDownloadsWhere).toHaveBeenCalledTimes(1)
      expect(database.getAllDownloadsWhere).toHaveBeenCalledWith({ active: true })

      expect(database.endPause).toHaveBeenCalledTimes(2)
      expect(database.endPause).toHaveBeenCalledWith(42)
      expect(database.endPause).toHaveBeenCalledWith(43)

      expect(database.updateDownloadsWhere).toHaveBeenCalledTimes(1)
      expect(database.updateDownloadsWhere).toHaveBeenCalledWith({
        cancelId: 'mock-delete-id'
      }, {
        cancelId: null
      })

      expect(database.updateFilesWhere).toHaveBeenCalledTimes(1)
      expect(database.updateFilesWhere).toHaveBeenCalledWith({
        cancelId: 'mock-delete-id'
      }, {
        cancelId: null
      })
    })
  })
})
