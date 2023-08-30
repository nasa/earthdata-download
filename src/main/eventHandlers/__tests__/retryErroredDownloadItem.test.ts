// @ts-nocheck

import MockDate from 'mockdate'

import downloadStates from '../../../app/constants/downloadStates'

import retryErroredDownloadItem from '../retryErroredDownloadItem'

import startNextDownload from '../../utils/startNextDownload'

jest.mock('../../utils/startNextDownload', () => ({
  __esModule: true,
  default: jest.fn(() => {})
}))

beforeEach(() => {
  MockDate.set('2023-05-13T22:00:00')
})

describe('retryErroredDownloadItem', () => {
  describe('when only downloadId is provided', () => {
    test('updates the files and calls startNextDownload', async () => {
      const currentDownloadItems = {}
      const database = {
        updateFilesWhere: jest.fn(),
        updateDownloadById: jest.fn(),
        deletePausesByDownloadIdAndFilename: jest.fn(),
        deleteFilePausesByDownloadId: jest.fn(),
        getDownloadById: jest.fn()
          .mockResolvedValue({ timeEnd: null }),
        createPauseWith: jest.fn()
      }
      const downloadIdContext = {}
      const webContents = {}
      const info = {
        downloadId: 'mock-download-id'
      }

      await retryErroredDownloadItem({
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
        state: downloadStates.pending,
        percent: 0,
        timeStart: null,
        timeEnd: null,
        errors: null,
        receivedBytes: null,
        totalBytes: null
      })

      expect(database.getDownloadById).toHaveBeenCalledTimes(1)
      expect(database.getDownloadById).toHaveBeenCalledWith('mock-download-id')

      expect(database.createPauseWith).toHaveBeenCalledTimes(0)

      expect(database.deletePausesByDownloadIdAndFilename).toHaveBeenCalledTimes(0)

      expect(database.deleteFilePausesByDownloadId).toHaveBeenCalledTimes(1)
      expect(database.deleteFilePausesByDownloadId).toHaveBeenCalledWith('mock-download-id')

      expect(startNextDownload).toHaveBeenCalledTimes(1)
    })
  })

  describe('when the download is already finished', () => {
    test('updates the files and calls startNextDownload', async () => {
      const currentDownloadItems = {}
      const database = {
        updateFilesWhere: jest.fn(),
        updateDownloadById: jest.fn(),
        deletePausesByDownloadIdAndFilename: jest.fn(),
        deleteFilePausesByDownloadId: jest.fn(),
        getDownloadById: jest.fn()
          .mockResolvedValue({ timeEnd: 123 }),
        createPauseWith: jest.fn()
      }
      const downloadIdContext = {}
      const webContents = {}
      const info = {
        downloadId: 'mock-download-id'
      }

      await retryErroredDownloadItem({
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
        state: downloadStates.pending,
        percent: 0,
        timeStart: null,
        timeEnd: null,
        errors: null,
        receivedBytes: null,
        totalBytes: null
      })

      expect(database.getDownloadById).toHaveBeenCalledTimes(1)
      expect(database.getDownloadById).toHaveBeenCalledWith('mock-download-id')

      expect(database.createPauseWith).toHaveBeenCalledTimes(1)
      expect(database.createPauseWith).toHaveBeenCalledWith({
        downloadId: 'mock-download-id',
        timeEnd: 1684029600000,
        timeStart: 123
      })

      expect(database.deletePausesByDownloadIdAndFilename).toHaveBeenCalledTimes(0)

      expect(database.deleteFilePausesByDownloadId).toHaveBeenCalledTimes(1)
      expect(database.deleteFilePausesByDownloadId).toHaveBeenCalledWith('mock-download-id')

      expect(startNextDownload).toHaveBeenCalledTimes(1)
    })
  })
})
