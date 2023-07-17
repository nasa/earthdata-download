import resumeDownloadItem from '../resumeDownloadItem'
import downloadStates from '../../../app/constants/downloadStates'

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
        getAllDownloads: jest.fn(),
        getFileCountWhere: jest.fn(),
        updateDownloadById: jest.fn(),
        updateFilesWhere: jest.fn()
      }

      await resumeDownloadItem({
        currentDownloadItems,
        database,
        info
      })

      expect(currentDownloadItems.resumeItem).toHaveBeenCalledTimes(1)
      expect(currentDownloadItems.resumeItem).toHaveBeenCalledWith('mock-download-id', 'mock-filename.png')

      // Resume specific files on the `files` table
      expect(database.updateFilesWhere).toHaveBeenCalledTimes(1)
      expect(database.updateFilesWhere).toHaveBeenCalledWith({
        downloadId: 'mock-download-id',
        filename: 'mock-filename.png'
      }, { state: downloadStates.active })

      expect(database.getAllDownloads).toHaveBeenCalledTimes(0)
      expect(database.getFileCountWhere).toHaveBeenCalledTimes(0)
      expect(database.updateDownloadById).toHaveBeenCalledTimes(0)
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
          getAllDownloads: jest.fn(),
          getFileCountWhere: jest.fn().mockResolvedValue(0),
          updateDownloadById: jest.fn()
        }

        await resumeDownloadItem({
          currentDownloadItems,
          database,
          info
        })

        expect(currentDownloadItems.resumeItem).toHaveBeenCalledTimes(1)
        expect(currentDownloadItems.resumeItem).toHaveBeenCalledWith('mock-download-id', undefined)

        expect(database.getAllDownloads).toHaveBeenCalledTimes(0)

        expect(database.getFileCountWhere).toHaveBeenCalledTimes(1)
        expect(database.getFileCountWhere).toHaveBeenCalledWith({ downloadId: 'mock-download-id' })

        expect(database.updateDownloadById).toHaveBeenCalledTimes(1)
        expect(database.updateDownloadById).toHaveBeenCalledWith('mock-download-id', { state: downloadStates.pending })
      })
    })

    describe('when the download has files', () => {
      test('calls currentDownloadItems.resumeItem and updates the database', async () => {
        const currentDownloadItems = {
          resumeItem: jest.fn()
        }
        const info = {
          downloadId: 'mock-download-id'
        }
        const database = {
          getAllDownloads: jest.fn(),
          getFileCountWhere: jest.fn().mockResolvedValue(1),
          updateDownloadById: jest.fn()
        }

        await resumeDownloadItem({
          currentDownloadItems,
          database,
          info
        })

        expect(currentDownloadItems.resumeItem).toHaveBeenCalledTimes(1)
        expect(currentDownloadItems.resumeItem).toHaveBeenCalledWith('mock-download-id', undefined)

        expect(database.getAllDownloads).toHaveBeenCalledTimes(0)

        expect(database.getFileCountWhere).toHaveBeenCalledTimes(1)
        expect(database.getFileCountWhere).toHaveBeenCalledWith({ downloadId: 'mock-download-id' })

        expect(database.updateDownloadById).toHaveBeenCalledTimes(1)
        expect(database.updateDownloadById).toHaveBeenCalledWith('mock-download-id', { state: downloadStates.active })
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
        getAllDownloads: jest.fn().mockResolvedValue([{
          id: 'download1',
          state: downloadStates.complete
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
        updateDownloadById: jest.fn()
      }

      await resumeDownloadItem({
        currentDownloadItems,
        database,
        info
      })

      expect(currentDownloadItems.resumeItem).toHaveBeenCalledTimes(1)
      expect(currentDownloadItems.resumeItem).toHaveBeenCalledWith(undefined, undefined)

      expect(database.getAllDownloads).toHaveBeenCalledTimes(1)

      expect(database.getFileCountWhere).toHaveBeenCalledTimes(3)
      expect(database.getFileCountWhere).toHaveBeenCalledWith({ downloadId: 'download1' })
      expect(database.getFileCountWhere).toHaveBeenCalledWith({ downloadId: 'download2' })
      expect(database.getFileCountWhere).toHaveBeenCalledWith({ downloadId: 'download3' })

      expect(database.updateDownloadById).toHaveBeenCalledTimes(3)
      expect(database.updateDownloadById).toHaveBeenCalledWith('download1', { state: downloadStates.complete })
      expect(database.updateDownloadById).toHaveBeenCalledWith('download2', { state: downloadStates.active })
      expect(database.updateDownloadById).toHaveBeenCalledWith('download3', { state: downloadStates.pending })
    })
  })
})
