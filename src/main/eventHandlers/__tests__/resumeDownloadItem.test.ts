// @ts-nocheck

import resumeDownloadItem from '../resumeDownloadItem'
import downloadStates from '../../../app/constants/downloadStates'
import startNextDownload from '../../utils/startNextDownload'

jest.mock('../../utils/startNextDownload', () => ({
  __esModule: true,
  default: jest.fn(() => {})
}))

jest.mock('../../utils/metricsLogger.ts', () => ({
  __esModule: true,
  default: jest.fn(() => {})
}))

describe('resumeDownloadItem', () => {
  describe('when downloadId and name are provided', () => {
    test('calls currentDownloadItems.resumeItem', async () => {
      const currentDownloadItems = {
        resumeItem: jest.fn()
      }
      const info = {
        downloadId: 'mock-download-id',
        filename: 'mock-filename.png'
      }
      const database = {
        getAllDownloadsWhere: jest.fn().mockResolvedValue([
          {
            id: '7072_Test_2019.0-20231109_032409',
            state: 'PAUSED'
          },
          {
            id: 'AE_DySno_002-20231010_140411',
            state: 'PAUSED'
          }
        ]),
        getFileCountWhere: jest.fn(),
        updateDownloadById: jest.fn(),
        updateFilesWhere: jest.fn(),
        endPause: jest.fn()
      }

      await resumeDownloadItem({
        currentDownloadItems,
        database,
        downloadIdContext: {},
        info,
        webContents: {}
      })

      expect(currentDownloadItems.resumeItem).toHaveBeenCalledTimes(1)
      expect(currentDownloadItems.resumeItem).toHaveBeenCalledWith('mock-download-id', 'mock-filename.png')

      // Resume specific files on the `files` table
      expect(database.updateFilesWhere).toHaveBeenCalledTimes(1)
      expect(database.updateFilesWhere).toHaveBeenCalledWith({
        downloadId: 'mock-download-id',
        filename: 'mock-filename.png'
      }, { state: downloadStates.active })

      expect(database.getAllDownloadsWhere).toHaveBeenCalledTimes(1)
      expect(database.getFileCountWhere).toHaveBeenCalledTimes(0)
      expect(database.updateDownloadById).toHaveBeenCalledTimes(0)

      expect(database.endPause).toHaveBeenCalledTimes(1)
      expect(database.endPause).toHaveBeenCalledWith('mock-download-id', 'mock-filename.png')

      expect(startNextDownload).toHaveBeenCalledTimes(1)
      expect(startNextDownload).toHaveBeenCalledWith({
        currentDownloadItems,
        database,
        downloadIdContext: {},
        webContents: {}
      })
    })
  })

  describe('when only downloadId is provided', () => {
    describe('when the download does not have files', () => {
      test('calls currentDownloadItems.resumeItem and updates the database', async () => {
        const currentDownloadItems = {
          resumeItem: jest.fn()
        }
        const info = {
          downloadId: 'mock-download-id'
        }
        const database = {
          getAllDownloadsWhere: jest.fn().mockResolvedValue([
            {
              id: '7072_Test_2019.0-20231109_032409',
              state: 'PAUSED'
            },
            {
              id: 'AE_DySno_002-20231010_140411',
              state: 'PAUSED'
            }
          ]),
          getFileCountWhere: jest.fn().mockResolvedValue(0),
          updateDownloadById: jest.fn(),
          endPause: jest.fn()
        }

        await resumeDownloadItem({
          currentDownloadItems,
          database,
          downloadIdContext: {},
          info,
          webContents: {}
        })

        expect(currentDownloadItems.resumeItem).toHaveBeenCalledTimes(1)
        expect(currentDownloadItems.resumeItem).toHaveBeenCalledWith('mock-download-id', undefined)

        expect(database.getAllDownloadsWhere).toHaveBeenCalledTimes(1)

        expect(database.getFileCountWhere).toHaveBeenCalledTimes(1)
        expect(database.getFileCountWhere).toHaveBeenCalledWith({ downloadId: 'mock-download-id' })

        expect(database.updateDownloadById).toHaveBeenCalledTimes(1)
        expect(database.updateDownloadById).toHaveBeenCalledWith('mock-download-id', { state: downloadStates.pending })

        expect(database.endPause).toHaveBeenCalledTimes(1)
        expect(database.endPause).toHaveBeenCalledWith('mock-download-id')

        expect(startNextDownload).toHaveBeenCalledTimes(1)
        expect(startNextDownload).toHaveBeenCalledWith({
          currentDownloadItems,
          database,
          downloadIdContext: {},
          webContents: {}
        })
      })
    })

    describe('when the download has files', () => {
      test('calls currentDownloadItems.resumeItem and updates the database', async () => {
        const currentDownloadItems = {
          resumeItem: jest.fn(),
          endPause: jest.fn()
        }
        const info = {
          downloadId: 'mock-download-id'
        }
        const database = {
          getAllDownloadsWhere: jest.fn().mockResolvedValue([
            {
              id: '7072_Test_2019.0-20231109_032409',
              state: 'PAUSED'
            },
            {
              id: 'AE_DySno_002-20231010_140411',
              state: 'PAUSED'
            }
          ]),
          getFileCountWhere: jest.fn().mockResolvedValue(1),
          updateDownloadById: jest.fn(),
          endPause: jest.fn()
        }

        await resumeDownloadItem({
          currentDownloadItems,
          database,
          downloadIdContext: {},
          info,
          webContents: {}
        })

        expect(currentDownloadItems.resumeItem).toHaveBeenCalledTimes(1)
        expect(currentDownloadItems.resumeItem).toHaveBeenCalledWith('mock-download-id', undefined)

        expect(database.getAllDownloadsWhere).toHaveBeenCalledTimes(1)

        expect(database.getFileCountWhere).toHaveBeenCalledTimes(1)
        expect(database.getFileCountWhere).toHaveBeenCalledWith({ downloadId: 'mock-download-id' })

        expect(database.updateDownloadById).toHaveBeenCalledTimes(1)
        expect(database.updateDownloadById).toHaveBeenCalledWith('mock-download-id', { state: downloadStates.active })

        expect(database.endPause).toHaveBeenCalledTimes(1)
        expect(database.endPause).toHaveBeenCalledWith('mock-download-id')

        expect(startNextDownload).toHaveBeenCalledTimes(1)
        expect(startNextDownload).toHaveBeenCalledWith({
          currentDownloadItems,
          database,
          downloadIdContext: {},
          webContents: {}
        })
      })
    })
  })

  describe('when no downloadId or name is provided', () => {
    test('calls currentDownloadItems.resumeItem and updates the database', async () => {
      const currentDownloadItems = {
        resumeItem: jest.fn()
      }
      const info = {}
      const database = {
        getAllDownloadsWhere: jest.fn().mockResolvedValue([{
          id: 'download1',
          state: downloadStates.completed
        }, {
          id: 'download2',
          state: downloadStates.paused
        }, {
          id: 'download3',
          files: {},
          state: downloadStates.paused
        }]),
        getFileCountWhere: jest.fn()
          .mockResolvedValueOnce(1)
          .mockResolvedValueOnce(1)
          .mockResolvedValueOnce(0),
        updateDownloadById: jest.fn(),
        endPause: jest.fn()
      }

      await resumeDownloadItem({
        currentDownloadItems,
        database,
        downloadIdContext: {},
        info,
        webContents: {}
      })

      expect(currentDownloadItems.resumeItem).toHaveBeenCalledTimes(1)
      expect(currentDownloadItems.resumeItem).toHaveBeenCalledWith(undefined, undefined)

      expect(database.getAllDownloadsWhere).toHaveBeenCalledTimes(2)
      expect(database.getAllDownloadsWhere).toHaveBeenCalledWith({ active: true })

      expect(database.getFileCountWhere).toHaveBeenCalledTimes(3)
      expect(database.getFileCountWhere).toHaveBeenCalledWith({ downloadId: 'download1' })
      expect(database.getFileCountWhere).toHaveBeenCalledWith({ downloadId: 'download2' })
      expect(database.getFileCountWhere).toHaveBeenCalledWith({ downloadId: 'download3' })

      expect(database.updateDownloadById).toHaveBeenCalledTimes(3)
      expect(database.updateDownloadById).toHaveBeenCalledWith('download1', { state: downloadStates.active })
      expect(database.updateDownloadById).toHaveBeenCalledWith('download2', { state: downloadStates.active })
      expect(database.updateDownloadById).toHaveBeenCalledWith('download3', { state: downloadStates.pending })

      expect(database.endPause).toHaveBeenCalledTimes(3)
      expect(database.endPause).toHaveBeenCalledWith('download1')
      expect(database.endPause).toHaveBeenCalledWith('download2')
      expect(database.endPause).toHaveBeenCalledWith('download3')

      expect(startNextDownload).toHaveBeenCalledTimes(1)
      expect(startNextDownload).toHaveBeenCalledWith({
        currentDownloadItems,
        database,
        downloadIdContext: {},
        webContents: {}
      })
    })
  })
})
