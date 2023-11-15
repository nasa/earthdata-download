// @ts-nocheck

import setCancellingDownload from '../setCancellingDownload'

import downloadStates from '../../../app/constants/downloadStates'

jest.mock('../../utils/metricsLogger.ts', () => ({
  __esModule: true,
  default: jest.fn(() => {})
}))

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
        updateFilesWhere: jest.fn(),
        getDownloadReport: jest.fn().mockResolvedValue({
          percentSum: 196,
          totalFiles: 7,
          finishedFiles: 1
        }),
        getAllDownloadsWhere: jest.fn().mockResolvedValue([
          {
            id: '7072_Test_2019.0-20231109_032409',
            state: 'ACTIVE'
          },
          {
            id: 'AE_DySno_002-20231010_140411',
            state: 'ACTIVE'
          }
        ])
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
        updateFilesWhere: jest.fn(),
        getDownloadReport: jest.fn().mockResolvedValue({
          percentSum: 196,
          totalFiles: 7,
          finishedFiles: 1
        }),
        getAllDownloadsWhere: jest.fn().mockResolvedValue([
          {
            id: '7072_Test_2019.0-20231109_032409',
            state: 'ACTIVE'
          },
          {
            id: 'AE_DySno_002-20231010_140411',
            state: 'ACTIVE'
          }
        ])
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
        updateFilesWhere: jest.fn(),
        getDownloadReport: jest.fn().mockResolvedValue({
          percentSum: 196,
          totalFiles: 7,
          finishedFiles: 1
        }),
        getAllDownloadsWhere: jest.fn().mockResolvedValue([
          {
            id: '7072_Test_2019.0-20231109_032409',
            state: 'ACTIVE'
          },
          {
            id: 'AE_DySno_002-20231010_140411',
            state: 'ACTIVE'
          }
        ])
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
