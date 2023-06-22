import pauseDownloadItem from '../pauseDownloadItem'

describe('pauseDownloadItem', () => {
  describe('when downloadId and name are provided', () => {
    test('calls currentDownloadItems.pauseItem', async () => {
      const currentDownloadItems = {
        pauseItem: jest.fn()
      }
      const info = {
        downloadId: 'mock-download-id',
        name: 'mock-filename.png'
      }
      const database = {
        updateDownloadById: jest.fn(),
        updateDownloadsWhereIn: jest.fn()
      }

      await pauseDownloadItem({
        currentDownloadItems,
        database,
        info
      })

      expect(currentDownloadItems.pauseItem).toHaveBeenCalledTimes(1)
      expect(currentDownloadItems.pauseItem).toHaveBeenCalledWith('mock-download-id', 'mock-filename.png')

      expect(database.updateDownloadById).toHaveBeenCalledTimes(0)
      expect(database.updateDownloadsWhereIn).toHaveBeenCalledTimes(0)
    })
  })

  describe('when only downloadId is provided', () => {
    test('calls currentDownloadItems.pauseItem and updates the database', async () => {
      const currentDownloadItems = {
        pauseItem: jest.fn()
      }
      const info = {
        downloadId: 'mock-download-id'
      }
      const database = {
        updateDownloadById: jest.fn(),
        updateDownloadsWhereIn: jest.fn()
      }

      await pauseDownloadItem({
        currentDownloadItems,
        database,
        info
      })

      expect(currentDownloadItems.pauseItem).toHaveBeenCalledTimes(1)
      expect(currentDownloadItems.pauseItem).toHaveBeenCalledWith('mock-download-id', undefined)

      expect(database.updateDownloadById).toHaveBeenCalledTimes(1)
      expect(database.updateDownloadById).toHaveBeenCalledWith('mock-download-id', { state: 'PAUSED' })

      expect(database.updateDownloadsWhereIn).toHaveBeenCalledTimes(0)
    })
  })

  describe('when no downloadId or name is provided', () => {
    test('calls currentDownloadItems.pauseItem and updates the database', async () => {
      const currentDownloadItems = {
        pauseItem: jest.fn()
      }
      const info = {}
      const database = {
        updateDownloadById: jest.fn(),
        updateDownloadsWhereIn: jest.fn()
      }

      await pauseDownloadItem({
        currentDownloadItems,
        database,
        info
      })

      expect(currentDownloadItems.pauseItem).toHaveBeenCalledTimes(1)
      expect(currentDownloadItems.pauseItem).toHaveBeenCalledWith(undefined, undefined)

      expect(database.updateDownloadById).toHaveBeenCalledTimes(0)

      expect(database.updateDownloadsWhereIn).toHaveBeenCalledTimes(1)
      expect(database.updateDownloadsWhereIn).toHaveBeenCalledWith(
        [
          'state',
          ['ACTIVE', 'PENDING']
        ],
        { state: 'PAUSED' }
      )
    })
  })
})
