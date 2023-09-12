import clearDownloadHistory from '../clearDownloadHistory'

describe('clearDownloadHistory', () => {
  describe('when a downloadId is not passed in', () => {
    test('ensure that downloads, files, and pauses which are not active are deleted', async () => {
      const info = {}
      const database = {
        clearDownloadHistoryDownloads: jest.fn()
      }

      await clearDownloadHistory({
        database,
        info
      })

      expect(database.clearDownloadHistoryDownloads).toHaveBeenCalledTimes(1)
      // `clearDownloadHistoryDownloads` is called with no arguments
      expect(database.clearDownloadHistoryDownloads).toHaveBeenCalledWith()
    })
  })

  describe('when a downloadId is passed in', () => {
    test('ensure only the downloads, files, and pauses associated to the downloadId are deleted', async () => {
      const info = {
        downloadId: 'mock-download-id'
      }
      const database = {
        clearDownloadHistoryDownloads: jest.fn()
      }

      await clearDownloadHistory({
        database,
        info
      })

      expect(database.clearDownloadHistoryDownloads).toHaveBeenCalledTimes(1)
      expect(database.clearDownloadHistoryDownloads).toHaveBeenCalledWith('mock-download-id')
    })
  })
})
