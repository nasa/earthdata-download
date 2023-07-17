// @ts-nocheck

import deleteDownload from '../deleteDownload'

describe('deleteDownload', () => {
  describe('when only downloadId is provided', () => {
    test('deletes the download from the database', async () => {
      const database = {
        deleteDownloadById: jest.fn()
      }
      const info = {
        downloadId: 'mock-download-id',
        filename: null
      }

      await deleteDownload({
        database,
        info
      })

      expect(database.deleteDownloadById).toHaveBeenCalledTimes(1)
      expect(database.deleteDownloadById).toHaveBeenCalledWith('mock-download-id')
    })
  })
})
