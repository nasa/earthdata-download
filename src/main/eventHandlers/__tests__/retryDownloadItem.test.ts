// @ts-nocheck

import downloadStates from '../../../app/constants/downloadStates'

import retryDownloadItem from '../retryErroredDownloadItem'

import startNextDownload from '../../utils/startNextDownload'

jest.mock('../../utils/startNextDownload', () => ({
  __esModule: true,
  default: jest.fn(() => {})
}))

describe('retryDownloadItem', () => {
  describe('when downloadId and filename are provided', () => {
    test('updates the file and calls startNextDownload', async () => {
      const currentDownloadItems = {}
      const database = {
        updateFilesWhere: jest.fn()
      }
      const downloadIdContext = {}
      const webContents = {}
      const info = {
        downloadId: 'mock-download-id',
        filename: 'mock-filename.png'
      }

      await retryDownloadItem({
        currentDownloadItems,
        database,
        downloadIdContext,
        info,
        webContents
      })

      expect(database.updateFilesWhere).toHaveBeenCalledTimes(1)
      expect(database.updateFilesWhere).toHaveBeenCalledWith({
        downloadId: 'mock-download-id',
        filename: 'mock-filename.png'
      }, {
        state: downloadStates.pending
      })

      expect(startNextDownload).toHaveBeenCalledTimes(1)
    })
  })

  describe('when only downloadId is provided', () => {
    test('updates the files and calls startNextDownload', async () => {
      const currentDownloadItems = {}
      const database = {
        updateFilesWhere: jest.fn()
      }
      const downloadIdContext = {}
      const webContents = {}
      const info = {
        downloadId: 'mock-download-id'
      }

      await retryDownloadItem({
        currentDownloadItems,
        database,
        downloadIdContext,
        info,
        webContents
      })

      expect(database.updateFilesWhere).toHaveBeenCalledTimes(1)
      expect(database.updateFilesWhere).toHaveBeenCalledWith({
        downloadId: 'mock-download-id',
        state: downloadStates.error
      }, {
        state: downloadStates.pending
      })

      expect(startNextDownload).toHaveBeenCalledTimes(1)
    })
  })
})
