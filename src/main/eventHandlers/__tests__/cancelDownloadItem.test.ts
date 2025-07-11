// @ts-nocheck

import MockDate from 'mockdate'

import cancelDownloadItem from '../cancelDownloadItem'

import downloadStates from '../../../app/constants/downloadStates'
import metricsEvent from '../../../app/constants/metricsEvent'
import metricsLogger from '../../utils/metricsLogger.ts'

beforeEach(() => {
  MockDate.set('2023-05-01')
})

jest.mock('../../utils/metricsLogger.ts', () => ({
  __esModule: true,
  default: jest.fn(() => {})
}))

describe('cancelDownloadItem', () => {
  describe('when downloadId and name are provided', () => {
    test('updates the file state', async () => {
      const currentDownloadItems = {
        cancelItem: jest.fn()
      }
      const info = {
        downloadId: 'mock-download-id',
        filename: 'mock-filename.png'
      }
      const database = {
        endPause: jest.fn(),
        updateDownloadsWhereAndWhereNotIn: jest.fn(),
        updateDownloadById: jest.fn(),
        updateFilesWhere: jest.fn(),
        getNotCompletedFilesCountByDownloadId: jest.fn()
      }

      await cancelDownloadItem({
        currentDownloadItems,
        database,
        info
      })

      expect(metricsLogger).toHaveBeenCalledTimes(1)
      expect(metricsLogger).toHaveBeenCalledWith(database, {
        eventType: metricsEvent.downloadItemCancel,
        data: {
          downloadId: 'mock-download-id'
        }
      })

      expect(currentDownloadItems.cancelItem).toHaveBeenCalledTimes(1)
      expect(currentDownloadItems.cancelItem).toHaveBeenCalledWith('mock-download-id', 'mock-filename.png')

      expect(database.updateFilesWhere).toHaveBeenCalledTimes(1)
      expect(database.updateFilesWhere).toHaveBeenCalledWith({
        downloadId: 'mock-download-id',
        filename: 'mock-filename.png'
      }, {
        cancelId: null,
        state: downloadStates.cancelled
      })

      expect(database.getNotCompletedFilesCountByDownloadId).toHaveBeenCalledTimes(1)

      expect(database.endPause).toHaveBeenCalledTimes(0)
      expect(database.updateDownloadById).toHaveBeenCalledTimes(0)
      expect(database.updateDownloadsWhereAndWhereNotIn).toHaveBeenCalledTimes(0)
    })
  })

  describe('when only downloadId is provided', () => {
    test('updates the files state', async () => {
      const currentDownloadItems = {
        cancelItem: jest.fn()
      }
      const info = {
        downloadId: 'mock-download-id'
      }
      const database = {
        endPause: jest.fn(),
        updateDownloadsWhereAndWhereNotIn: jest.fn(),
        updateDownloadById: jest.fn(),
        updateFilesWhere: jest.fn(),
        updateFilesWhereAndWhereNot: jest.fn()
      }

      await cancelDownloadItem({
        currentDownloadItems,
        database,
        info
      })

      expect(metricsLogger).toHaveBeenCalledTimes(1)
      expect(metricsLogger).toHaveBeenCalledWith(database, {
        eventType: metricsEvent.downloadCancel,
        data: {
          downloadIds: ['mock-download-id'],
          cancelCount: 1
        }
      })

      expect(currentDownloadItems.cancelItem).toHaveBeenCalledTimes(1)
      expect(currentDownloadItems.cancelItem).toHaveBeenCalledWith('mock-download-id', undefined)

      expect(database.updateDownloadById).toHaveBeenCalledTimes(1)
      expect(database.updateDownloadById).toHaveBeenCalledWith('mock-download-id', {
        state: downloadStates.cancelled,
        timeEnd: 1682899200000
      })

      expect(database.updateFilesWhereAndWhereNot).toHaveBeenCalledTimes(1)
      expect(database.updateFilesWhereAndWhereNot).toHaveBeenCalledWith(
        { downloadId: 'mock-download-id' },
        { state: downloadStates.completed },
        {
          cancelId: null,
          state: downloadStates.cancelled
        }
      )

      expect(database.endPause).toHaveBeenCalledTimes(1)
      expect(database.endPause).toHaveBeenCalledWith('mock-download-id')

      expect(database.updateFilesWhere).toHaveBeenCalledTimes(0)
      expect(database.updateDownloadsWhereAndWhereNotIn).toHaveBeenCalledTimes(0)
    })
  })

  describe('when no downloadId or name is provided', () => {
    test('calls currentDownloadItems.cancelItem and updates the database', async () => {
      const currentDownloadItems = {
        cancelItem: jest.fn()
      }
      const info = {}
      const database = {
        endPause: jest.fn(),
        deleteDownloadById: jest.fn(),
        updateDownloadsWhereAndWhereNotIn: jest.fn().mockResolvedValue([
          { id: 123 },
          { id: 456 }
        ]),
        updateDownloadById: jest.fn()
      }

      await cancelDownloadItem({
        currentDownloadItems,
        database,
        info
      })

      expect(metricsLogger).toHaveBeenCalledTimes(1)
      expect(metricsLogger).toHaveBeenCalledWith(database, {
        eventType: metricsEvent.downloadCancel,
        data: {
          downloadIds: [123, 456],
          cancelCount: 2
        }
      })

      expect(currentDownloadItems.cancelItem).toHaveBeenCalledTimes(1)
      expect(currentDownloadItems.cancelItem).toHaveBeenCalledWith(undefined, undefined)

      expect(database.updateDownloadById).toHaveBeenCalledTimes(0)

      expect(database.deleteDownloadById).toHaveBeenCalledTimes(0)

      expect(database.updateDownloadsWhereAndWhereNotIn).toHaveBeenCalledTimes(1)
      expect(database.updateDownloadsWhereAndWhereNotIn).toHaveBeenCalledWith({
        active: true
      }, [
        'state', [downloadStates.completed, downloadStates.cancelled]
      ], {
        cancelId: null,
        state: downloadStates.cancelled,
        timeEnd: 1682899200000
      })

      expect(database.endPause).toHaveBeenCalledTimes(2)
      expect(database.endPause).toHaveBeenCalledWith(123)
      expect(database.endPause).toHaveBeenCalledWith(456)
    })
  })
})
