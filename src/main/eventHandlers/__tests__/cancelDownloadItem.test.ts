// @ts-nocheck

import MockDate from 'mockdate'

import cancelDownloadItem from '../cancelDownloadItem'

import downloadStates from '../../../app/constants/downloadStates'

beforeEach(() => {
  MockDate.set('2023-05-01')
})

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

      expect(currentDownloadItems.cancelItem).toHaveBeenCalledTimes(1)
      expect(currentDownloadItems.cancelItem).toHaveBeenCalledWith('mock-download-id', 'mock-filename.png')

      expect(database.updateFilesWhere).toHaveBeenCalledTimes(1)
      expect(database.updateFilesWhere).toHaveBeenCalledWith({
        downloadId: 'mock-download-id',
        filename: 'mock-filename.png'
      }, {
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
        { state: downloadStates.cancelled }
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

      expect(currentDownloadItems.cancelItem).toHaveBeenCalledTimes(1)
      expect(currentDownloadItems.cancelItem).toHaveBeenCalledWith(undefined, undefined)

      expect(database.updateDownloadById).toHaveBeenCalledTimes(0)

      expect(database.deleteDownloadById).toHaveBeenCalledTimes(0)

      expect(database.updateDownloadsWhereAndWhereNotIn).toHaveBeenCalledTimes(1)
      expect(database.updateDownloadsWhereAndWhereNotIn).toHaveBeenCalledWith({
        active: true
      }, [
        'state', ['COMPLETED', 'CANCELLED']
      ], {
        state: 'CANCELLED',
        timeEnd: 1682899200000
      })

      expect(database.endPause).toHaveBeenCalledTimes(2)
      expect(database.endPause).toHaveBeenCalledWith(123)
      expect(database.endPause).toHaveBeenCalledWith(456)
    })
  })
})
