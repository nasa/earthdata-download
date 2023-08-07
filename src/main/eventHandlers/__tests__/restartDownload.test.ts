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
        updateDownloadById: jest.fn(),
        updateFilesWhere: jest.fn()
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
        updateDownloadById: jest.fn(),
        updateFilesWhere: jest.fn()
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
        state: 'ACTIVE',
        timeEnd: null
      })

      expect(startNextDownload).toHaveBeenCalledTimes(1)
    })
  })
})
