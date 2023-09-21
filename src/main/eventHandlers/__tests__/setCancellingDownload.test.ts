// @ts-nocheck

import setCancellingDownload from '../setCancellingDownload'

import downloadStates from '../../../app/constants/downloadStates'

describe('setCancellingDownload', () => {
  describe('when no filename is provided', () => {
    test('updates the database', async () => {
      const currentDownloadItems = {
        pauseItem: jest.fn()
      }
      const info = {
        downloadId: 'mock-download-id',
        cancelId: 'mock-cancel-id'
      }
      const database = {
        createPauseByDownloadId: jest.fn(),
        updateDownloadById: jest.fn(),
        updateFilesWhere: jest.fn()
      }

      await setCancellingDownload({
        currentDownloadItems,
        database,
        info
      })

      expect(currentDownloadItems.pauseItem).toHaveBeenCalledTimes(1)
      expect(currentDownloadItems.pauseItem).toHaveBeenCalledWith('mock-download-id', undefined)

      expect(database.createPauseByDownloadId).toHaveBeenCalledTimes(1)
      expect(database.createPauseByDownloadId).toHaveBeenCalledWith('mock-download-id', true)

      expect(database.updateDownloadById).toHaveBeenCalledTimes(1)
      expect(database.updateDownloadById).toHaveBeenCalledWith('mock-download-id', {
        cancelId: 'mock-cancel-id'
      })

      expect(database.updateFilesWhere).toHaveBeenCalledTimes(1)
      expect(database.updateFilesWhere).toHaveBeenCalledWith({
        downloadId: 'mock-download-id'
      }, {
        cancelId: 'mock-cancel-id'
      })
    })
  })

  describe('when a filename is provided', () => {
    test('updates the database', async () => {
      const currentDownloadItems = {
        pauseItem: jest.fn()
      }
      const info = {
        downloadId: 'mock-download-id',
        filename: 'mock-filename',
        cancelId: 'mock-cancel-id'
      }
      const database = {
        createPauseByDownloadIdAndFilename: jest.fn(),
        updateDownloadById: jest.fn(),
        updateFilesWhere: jest.fn()
      }

      await setCancellingDownload({
        currentDownloadItems,
        database,
        info
      })

      expect(currentDownloadItems.pauseItem).toHaveBeenCalledTimes(1)
      expect(currentDownloadItems.pauseItem).toHaveBeenCalledWith('mock-download-id', 'mock-filename')

      expect(database.createPauseByDownloadIdAndFilename).toHaveBeenCalledTimes(1)
      expect(database.createPauseByDownloadIdAndFilename).toHaveBeenCalledWith('mock-download-id', 'mock-filename')

      expect(database.updateDownloadById).toHaveBeenCalledTimes(1)
      expect(database.updateDownloadById).toHaveBeenCalledWith('mock-download-id', {
        cancelId: 'mock-cancel-id'
      })

      expect(database.updateFilesWhere).toHaveBeenCalledTimes(1)
      expect(database.updateFilesWhere).toHaveBeenCalledWith({
        downloadId: 'mock-download-id',
        filename: 'mock-filename'
      }, {
        cancelId: 'mock-cancel-id'
      })
    })
  })

  describe('when a downloadId is provided', () => {
    test('updates the database', async () => {
      const currentDownloadItems = {
        pauseItem: jest.fn()
      }
      const info = {
        cancelId: 'mock-cancel-id'
      }
      const database = {
        createPauseForAllActiveDownloads: jest.fn(),
        updateDownloadById: jest.fn(),
        updateDownloadsWhereAndWhereNotIn: jest.fn()
          .mockResolvedValue([{
            id: 'mock-download-id'
          }]),
        updateFilesWhere: jest.fn()
      }

      await setCancellingDownload({
        currentDownloadItems,
        database,
        info
      })

      expect(currentDownloadItems.pauseItem).toHaveBeenCalledTimes(1)
      expect(currentDownloadItems.pauseItem).toHaveBeenCalledWith(undefined, undefined)

      expect(database.createPauseForAllActiveDownloads).toHaveBeenCalledTimes(1)
      expect(database.createPauseForAllActiveDownloads).toHaveBeenCalledWith()

      expect(database.updateDownloadById).toHaveBeenCalledTimes(0)

      expect(database.updateDownloadsWhereAndWhereNotIn).toHaveBeenCalledTimes(1)
      expect(database.updateDownloadsWhereAndWhereNotIn).toHaveBeenCalledWith(
        { active: true },
        ['state', [downloadStates.completed, downloadStates.cancelled]],
        { cancelId: 'mock-cancel-id' }
      )

      expect(database.updateFilesWhere).toHaveBeenCalledTimes(1)
      expect(database.updateFilesWhere).toHaveBeenCalledWith({
        downloadId: 'mock-download-id'
      }, {
        cancelId: 'mock-cancel-id'
      })
    })
  })
})
