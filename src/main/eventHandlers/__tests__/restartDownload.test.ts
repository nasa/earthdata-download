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
    test('updates the files and calls startNextDownload', async () => {
      const currentDownloadItems = {}
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

      expect(database.updateFilesWhere).toHaveBeenCalledTimes(1)
      expect(database.updateFilesWhere).toHaveBeenCalledWith({
        downloadId: 'mock-download-id'
      }, {
        state: downloadStates.pending
      })

      expect(database.updateDownloadById).toHaveBeenCalledTimes(1)
      expect(database.updateDownloadById).toHaveBeenCalledWith(
        'mock-download-id',
        {
          state: downloadStates.active,
          timeStart: 1682899200000
        }
      )

      expect(startNextDownload).toHaveBeenCalledTimes(1)
    })
  })
})
