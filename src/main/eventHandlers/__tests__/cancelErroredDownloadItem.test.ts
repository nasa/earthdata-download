// @ts-nocheck

import downloadStates from '../../../app/constants/downloadStates'

import cancelErroredDownloadItem from '../cancelErroredDownloadItem'

import finishDownload from '../willDownloadEvents/finishDownload'

jest.mock('../willDownloadEvents/finishDownload', () => ({
  __esModule: true,
  default: jest.fn(() => { })
}))

describe('cancelErroredDownloadItem', () => {
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
        updateFilesWhere: jest.fn()
      }

      await cancelErroredDownloadItem({
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

      expect(finishDownload).toHaveBeenCalledTimes(1)
      expect(finishDownload).toHaveBeenCalledWith(expect.objectContaining({
        downloadId: info.downloadId
      }))
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
        updateFilesWhere: jest.fn()
      }

      await cancelErroredDownloadItem({
        currentDownloadItems,
        database,
        info
      })

      expect(currentDownloadItems.cancelItem).toHaveBeenCalledTimes(1)
      expect(currentDownloadItems.cancelItem).toHaveBeenCalledWith('mock-download-id', undefined)

      expect(database.updateFilesWhere).toHaveBeenCalledTimes(1)
      expect(database.updateFilesWhere).toHaveBeenCalledWith({
        downloadId: 'mock-download-id',
        state: downloadStates.error
      }, {
        state: downloadStates.cancelled
      })

      expect(finishDownload).toHaveBeenCalledTimes(1)
      expect(finishDownload).toHaveBeenCalledWith(expect.objectContaining({
        downloadId: info.downloadId
      }))
    })
  })
})
