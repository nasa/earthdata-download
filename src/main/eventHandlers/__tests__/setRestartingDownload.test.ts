import setRestartingDownload from '../setRestartingDownload'

describe('setRestartingDownload', () => {
  describe('when no filename is provided', () => {
    test('calls database.updateFilesWhere', async () => {
      const info = {
        downloadId: 'mock-download-id',
        restartId: 'mock-restart-id'
      }
      const database = {
        updateDownloadById: jest.fn(),
        updateFilesWhere: jest.fn()
      }

      await setRestartingDownload({
        database,
        info
      })

      expect(database.updateDownloadById).toHaveBeenCalledTimes(1)
      expect(database.updateDownloadById).toHaveBeenCalledWith('mock-download-id', {
        restartId: 'mock-restart-id'
      })

      expect(database.updateFilesWhere).toHaveBeenCalledTimes(1)
      expect(database.updateFilesWhere).toHaveBeenCalledWith({
        downloadId: 'mock-download-id'
      }, {
        restartId: 'mock-restart-id'
      })
    })
  })

  describe('when a filename is provided', () => {
    test('calls database.updateFilesWhere', async () => {
      const info = {
        downloadId: 'mock-download-id',
        filename: 'mock-filename',
        restartId: 'mock-restart-id'
      }
      const database = {
        updateDownloadById: jest.fn(),
        updateFilesWhere: jest.fn()
      }

      await setRestartingDownload({
        database,
        info
      })

      expect(database.updateDownloadById).toHaveBeenCalledTimes(1)
      expect(database.updateDownloadById).toHaveBeenCalledWith('mock-download-id', {
        restartId: 'mock-restart-id'
      })

      expect(database.updateFilesWhere).toHaveBeenCalledTimes(1)
      expect(database.updateFilesWhere).toHaveBeenCalledWith({
        downloadId: 'mock-download-id',
        filename: 'mock-filename'
      }, {
        restartId: 'mock-restart-id'
      })
    })
  })
})
