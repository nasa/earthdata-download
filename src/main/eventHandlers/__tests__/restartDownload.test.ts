// @ts-nocheck

import MockDate from 'mockdate'

import downloadStates from '../../../app/constants/downloadStates'

import restartDownload from '../restartDownload'

import startNextDownload from '../../utils/startNextDownload'

jest.mock('../../utils/startNextDownload', () => ({
  __esModule: true,
  default: jest.fn(() => {})
}))

beforeEach(() => {
  MockDate.set('2023-05-01')

  jest.clearAllMocks()
})

describe('restartDownload', () => {
  describe('when only downloadId is provided', () => {
    test('updates the download and files and calls startNextDownload', async () => {
      const currentDownloadItems = {
        cancelItem: jest.fn()
      }
      const database = {
        createPauseWith: jest.fn(),
        getDownloadById: jest.fn()
          .mockResolvedValue({ timeEnd: null }),
        updateDownloadById: jest.fn(),
        updateFilesWhere: jest.fn(),
        deletePausesByDownloadIdAndFilename: jest.fn(),
        deleteAllPausesByDownloadId: jest.fn()
      }
      const downloadIdContext = {}
      const webContents = {}
      const info = {
        downloadId: 'mock-download-id'
      }

      await restartDownload({
        currentDownloadItems,
        database,
        downloadIdContext,
        info,
        webContents
      })

      expect(currentDownloadItems.cancelItem).toHaveBeenCalledTimes(1)
      expect(currentDownloadItems.cancelItem).toHaveBeenCalledWith('mock-download-id', undefined)

      expect(database.getDownloadById).toHaveBeenCalledTimes(0)
      expect(database.createPauseWith).toHaveBeenCalledTimes(0)

      expect(database.deletePausesByDownloadIdAndFilename).toHaveBeenCalledTimes(0)

      expect(database.deleteAllPausesByDownloadId).toHaveBeenCalledTimes(1)
      expect(database.deleteAllPausesByDownloadId).toHaveBeenCalledWith('mock-download-id')

      expect(database.updateFilesWhere).toHaveBeenCalledTimes(1)
      expect(database.updateFilesWhere).toHaveBeenCalledWith({
        downloadId: 'mock-download-id'
      }, {
        state: downloadStates.pending,
        percent: 0,
        timeStart: null,
        timeEnd: null,
        errors: null,
        receivedBytes: null,
        totalBytes: null
      })

      expect(database.updateDownloadById).toHaveBeenCalledTimes(1)
      expect(database.updateDownloadById).toHaveBeenCalledWith(
        'mock-download-id',
        {
          active: true,
          state: downloadStates.active,
          timeStart: 1682899200000,
          timeEnd: null,
          errors: null
        }
      )

      expect(startNextDownload).toHaveBeenCalledTimes(1)
    })
  })

  describe('when filename and downloadId are provided', () => {
    test('updates the file and calls startNextDownload', async () => {
      const currentDownloadItems = {
        cancelItem: jest.fn()
      }
      const database = {
        createPauseWith: jest.fn(),
        getDownloadById: jest.fn()
          .mockResolvedValue({ timeEnd: null }),
        updateDownloadById: jest.fn(),
        updateFilesWhere: jest.fn(),
        deletePausesByDownloadIdAndFilename: jest.fn(),
        deleteAllPausesByDownloadId: jest.fn()
      }
      const downloadIdContext = {}
      const webContents = {}
      const info = {
        downloadId: 'mock-download-id',
        filename: 'mock-filename'
      }

      await restartDownload({
        currentDownloadItems,
        database,
        downloadIdContext,
        info,
        webContents
      })

      expect(currentDownloadItems.cancelItem).toHaveBeenCalledTimes(1)
      expect(currentDownloadItems.cancelItem).toHaveBeenCalledWith('mock-download-id', 'mock-filename')

      expect(database.getDownloadById).toHaveBeenCalledTimes(1)
      expect(database.getDownloadById).toHaveBeenCalledWith('mock-download-id')

      expect(database.createPauseWith).toHaveBeenCalledTimes(0)

      expect(database.deletePausesByDownloadIdAndFilename).toHaveBeenCalledTimes(1)
      expect(database.deletePausesByDownloadIdAndFilename).toHaveBeenCalledWith('mock-download-id', 'mock-filename')

      expect(database.deleteAllPausesByDownloadId).toHaveBeenCalledTimes(0)

      expect(database.updateFilesWhere).toHaveBeenCalledTimes(1)
      expect(database.updateFilesWhere).toHaveBeenCalledWith({
        downloadId: 'mock-download-id',
        filename: 'mock-filename'
      }, {
        state: downloadStates.pending,
        percent: 0,
        timeStart: null,
        timeEnd: null,
        errors: null,
        receivedBytes: null,
        totalBytes: null
      })

      expect(database.updateDownloadById).toHaveBeenCalledTimes(1)
      expect(database.updateDownloadById).toHaveBeenCalledWith('mock-download-id', {
        errors: null,
        state: downloadStates.active,
        timeEnd: null
      })

      expect(startNextDownload).toHaveBeenCalledTimes(1)
    })
  })

  describe('when restarting a file when the download is already finished', () => {
    test('creates a new pause row', async () => {
      const currentDownloadItems = {
        cancelItem: jest.fn()
      }
      const database = {
        createPauseWith: jest.fn(),
        getDownloadById: jest.fn()
          .mockResolvedValue({ timeEnd: 1234 }),
        updateDownloadById: jest.fn(),
        updateFilesWhere: jest.fn(),
        deletePausesByDownloadIdAndFilename: jest.fn(),
        deleteAllPausesByDownloadId: jest.fn()
      }
      const downloadIdContext = {}
      const webContents = {}
      const info = {
        downloadId: 'mock-download-id',
        filename: 'mock-filename'
      }

      await restartDownload({
        currentDownloadItems,
        database,
        downloadIdContext,
        info,
        webContents
      })

      expect(currentDownloadItems.cancelItem).toHaveBeenCalledTimes(1)
      expect(currentDownloadItems.cancelItem).toHaveBeenCalledWith('mock-download-id', 'mock-filename')

      expect(database.getDownloadById).toHaveBeenCalledTimes(1)
      expect(database.getDownloadById).toHaveBeenCalledWith('mock-download-id')

      expect(database.createPauseWith).toHaveBeenCalledTimes(1)
      expect(database.createPauseWith).toHaveBeenCalledWith({
        downloadId: 'mock-download-id',
        timeEnd: 1682899200000,
        timeStart: 1234
      })

      expect(database.deletePausesByDownloadIdAndFilename).toHaveBeenCalledTimes(1)
      expect(database.deletePausesByDownloadIdAndFilename).toHaveBeenCalledWith('mock-download-id', 'mock-filename')

      expect(database.deleteAllPausesByDownloadId).toHaveBeenCalledTimes(0)

      expect(database.updateFilesWhere).toHaveBeenCalledTimes(1)
      expect(database.updateFilesWhere).toHaveBeenCalledWith({
        downloadId: 'mock-download-id',
        filename: 'mock-filename'
      }, {
        state: downloadStates.pending,
        percent: 0,
        timeStart: null,
        timeEnd: null,
        errors: null,
        receivedBytes: null,
        totalBytes: null
      })

      expect(database.updateDownloadById).toHaveBeenCalledTimes(1)
      expect(database.updateDownloadById).toHaveBeenCalledWith(
        'mock-download-id',
        {
          state: downloadStates.active,
          timeEnd: null,
          errors: null
        }
      )

      expect(startNextDownload).toHaveBeenCalledTimes(1)
    })
  })
})
