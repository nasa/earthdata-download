// @ts-nocheck

import setCancellingDownload from '../setCancellingDownload'

import downloadStates from '../../../app/constants/downloadStates'

describe('setCancellingDownload', () => {
  describe('when no filename is provided', () => {
    test('updates the database', async () => {
      const info = {
        downloadId: 'mock-download-id',
        cancelId: 'mock-cancel-id'
      }
      const database = {
        updateDownloadById: jest.fn(),
        updateFilesWhere: jest.fn()
      }

      await setCancellingDownload({
        database,
        info
      })

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
      const info = {
        downloadId: 'mock-download-id',
        filename: 'mock-filename',
        cancelId: 'mock-cancel-id'
      }
      const database = {
        updateDownloadById: jest.fn(),
        updateFilesWhere: jest.fn()
      }

      await setCancellingDownload({
        database,
        info
      })

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
      const info = {
        cancelId: 'mock-cancel-id'
      }
      const database = {
        updateDownloadById: jest.fn(),
        updateDownloadsWhereAndWhereNotIn: jest.fn()
          .mockResolvedValue([{
            id: 'mock-download-id'
          }]),
        updateFilesWhere: jest.fn()
      }

      await setCancellingDownload({
        database,
        info
      })

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
