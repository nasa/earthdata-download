// @ts-nocheck

import downloadStates from '../../../app/constants/downloadStates'

import cancelDownloadItem from '../cancelDownloadItem'

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
        deleteAllDownloads: jest.fn(),
        updateDownloadById: jest.fn(),
        updateFilesWhere: jest.fn()
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

      expect(database.updateDownloadById).toHaveBeenCalledTimes(0)
      expect(database.deleteAllDownloads).toHaveBeenCalledTimes(0)
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
        deleteAllDownloads: jest.fn(),
        updateDownloadById: jest.fn(),
        updateFilesWhere: jest.fn()
      }

      await cancelDownloadItem({
        currentDownloadItems,
        database,
        info
      })

      expect(currentDownloadItems.cancelItem).toHaveBeenCalledTimes(1)
      expect(currentDownloadItems.cancelItem).toHaveBeenCalledWith('mock-download-id', undefined)

      expect(database.updateDownloadById).toHaveBeenCalledTimes(1)
      expect(database.updateDownloadById).toHaveBeenCalledWith('mock-download-id', { state: 'CANCELLED' })

      expect(database.updateFilesWhere).toHaveBeenCalledTimes(0)
      expect(database.deleteAllDownloads).toHaveBeenCalledTimes(0)
    })
  })

  describe('when no downloadId or name is provided', () => {
    test('calls currentDownloadItems.cancelItem and updates the database', async () => {
      const currentDownloadItems = {
        cancelItem: jest.fn()
      }
      const info = {}
      const database = {
        deleteDownloadById: jest.fn(),
        deleteAllDownloads: jest.fn(),
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

      expect(database.deleteAllDownloads).toHaveBeenCalledTimes(1)
    })
  })
})
