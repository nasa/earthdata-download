// @ts-nocheck

import pauseDownloadItem from '../pauseDownloadItem'
import downloadStates from '../../../app/constants/downloadStates'
import metricsLogger from '../../utils/metricsLogger.ts'

jest.mock('../../utils/metricsLogger.ts', () => ({
  __esModule: true,
  default: jest.fn(() => {})
}))

describe('pauseDownloadItem', () => {
  describe('when downloadId and name are provided', () => {
    test('calls currentDownloadItems.pauseItem', async () => {
      const currentDownloadItems = {
        pauseItem: jest.fn()
      }
      const info = {
        downloadId: 'mock-download-id',
        filename: 'mock-filename.png'
      }
      const database = {
        updateDownloadById: jest.fn(),
        updateDownloadsWhereIn: jest.fn(),
        updateFilesWhere: jest.fn(),
        createPauseByDownloadIdAndFilename: jest.fn(),
        createPauseByDownloadId: jest.fn(),
        createPauseForAllActiveDownloads: jest.fn().mockResolvedValue([
          50, 2, ['mock-download-id-1', 'mock-download-id-2']
        ])
      }

      await pauseDownloadItem({
        currentDownloadItems,
        database,
        info
      })

      expect(currentDownloadItems.pauseItem).toHaveBeenCalledTimes(1)
      expect(currentDownloadItems.pauseItem).toHaveBeenCalledWith('mock-download-id', 'mock-filename.png')

      // Pause specific files on the `files` table
      expect(database.updateFilesWhere).toHaveBeenCalledTimes(1)
      expect(database.updateFilesWhere).toHaveBeenCalledWith({
        downloadId: 'mock-download-id',
        filename: 'mock-filename.png'
      }, { state: downloadStates.paused })

      expect(database.createPauseByDownloadIdAndFilename).toHaveBeenCalledTimes(1)
      expect(database.createPauseByDownloadIdAndFilename).toHaveBeenCalledWith('mock-download-id', 'mock-filename.png')

      expect(database.createPauseByDownloadId).toHaveBeenCalledTimes(0)
      expect(database.createPauseForAllActiveDownloads).toHaveBeenCalledTimes(0)

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
        updateDownloadsWhereIn: jest.fn(),
        updateFilesWhere: jest.fn(),
        createPauseByDownloadIdAndFilename: jest.fn(),
        createPauseByDownloadId: jest.fn(),
        createPauseForAllActiveDownloads: jest.fn().mockResolvedValue([
          50, 2, ['mock-download-id-1', 'mock-download-id-2']
        ])
      }

      await pauseDownloadItem({
        currentDownloadItems,
        database,
        info
      })

      expect(currentDownloadItems.pauseItem).toHaveBeenCalledTimes(1)
      expect(currentDownloadItems.pauseItem).toHaveBeenCalledWith('mock-download-id', undefined)

      expect(database.createPauseByDownloadIdAndFilename).toHaveBeenCalledTimes(0)
      expect(database.createPauseForAllActiveDownloads).toHaveBeenCalledTimes(0)

      expect(database.createPauseByDownloadId).toHaveBeenCalledTimes(1)
      expect(database.createPauseByDownloadId).toHaveBeenCalledWith('mock-download-id', true)

      expect(database.updateDownloadById).toHaveBeenCalledTimes(1)
      expect(database.updateDownloadById).toHaveBeenCalledWith('mock-download-id', { state: downloadStates.paused })

      expect(database.updateFilesWhere).toHaveBeenCalledTimes(0)
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
        updateDownloadsWhereIn: jest.fn(),
        updateFilesWhere: jest.fn(),
        createPauseByDownloadIdAndFilename: jest.fn(),
        createPauseByDownloadId: jest.fn(),
        createPauseForAllActiveDownloads: jest.fn().mockResolvedValue([
          50, 2, ['mock-download-id-1', 'mock-download-id-2']
        ])
      }

      await pauseDownloadItem({
        currentDownloadItems,
        database,
        info
      })

      expect(metricsLogger).toHaveBeenCalledTimes(1)
      expect(metricsLogger).toHaveBeenCalledWith({
        eventType: 'DownloadPause',
        data: {
          downloadIds: ['mock-download-id-1', 'mock-download-id-2'],
          downloadCount: 2
        }
      })

      expect(currentDownloadItems.pauseItem).toHaveBeenCalledTimes(1)
      expect(currentDownloadItems.pauseItem).toHaveBeenCalledWith(undefined, undefined)

      expect(database.createPauseByDownloadIdAndFilename).toHaveBeenCalledTimes(0)
      expect(database.createPauseByDownloadId).toHaveBeenCalledTimes(0)

      expect(database.createPauseForAllActiveDownloads).toHaveBeenCalledTimes(1)
      expect(database.createPauseForAllActiveDownloads).toHaveBeenCalledWith()

      expect(database.updateFilesWhere).toHaveBeenCalledTimes(0)
      expect(database.updateDownloadById).toHaveBeenCalledTimes(0)

      expect(database.updateDownloadsWhereIn).toHaveBeenCalledTimes(1)
      expect(database.updateDownloadsWhereIn).toHaveBeenCalledWith(
        [
          'state',
          [downloadStates.active, downloadStates.pending]
        ],
        { state: downloadStates.paused }
      )
    })
  })
})
