import cancelDownloadItem from '../cancelDownloadItem'

describe('cancelDownloadItem', () => {
  describe('when downloadId and name are provided', () => {
    test('calls currentDownloadItems.cancelItem', () => {
      const currentDownloadItems = {
        cancelItem: jest.fn()
      }
      const info = {
        downloadId: 'mock-download-id',
        name: 'mock-filename.png'
      }
      const store = {
        delete: jest.fn(),
        set: jest.fn()
      }

      cancelDownloadItem({
        currentDownloadItems,
        info,
        store
      })

      expect(currentDownloadItems.cancelItem).toHaveBeenCalledTimes(1)
      expect(currentDownloadItems.cancelItem).toHaveBeenCalledWith('mock-download-id', 'mock-filename.png')

      expect(store.set).toHaveBeenCalledTimes(1)
      expect(store.set).toHaveBeenCalledWith('downloads.mock-download-id.state', 'COMPLETED')
    })
  })

  describe('when only downloadId is provided', () => {
    test('calls currentDownloadItems.cancelItem and updates the store', () => {
      const currentDownloadItems = {
        cancelItem: jest.fn()
      }
      const info = {
        downloadId: 'mock-download-id'
      }
      const store = {
        delete: jest.fn(),
        set: jest.fn()
      }

      cancelDownloadItem({
        currentDownloadItems,
        info,
        store
      })

      expect(currentDownloadItems.cancelItem).toHaveBeenCalledTimes(1)
      expect(currentDownloadItems.cancelItem).toHaveBeenCalledWith('mock-download-id', undefined)

      expect(store.set).toHaveBeenCalledTimes(1)
      expect(store.set).toHaveBeenCalledWith('downloads.mock-download-id.state', 'COMPLETED')

      expect(store.delete).toHaveBeenCalledTimes(1)
      expect(store.delete).toHaveBeenCalledWith('downloads.mock-download-id')
    })
  })

  describe('when no downloadId or name is provided', () => {
    test('calls currentDownloadItems.cancelItem and updates the store', () => {
      const currentDownloadItems = {
        cancelItem: jest.fn()
      }
      const info = {}
      const store = {
        delete: jest.fn(),
        set: jest.fn()
      }

      cancelDownloadItem({
        currentDownloadItems,
        info,
        store
      })

      expect(currentDownloadItems.cancelItem).toHaveBeenCalledTimes(1)
      expect(currentDownloadItems.cancelItem).toHaveBeenCalledWith(undefined, undefined)

      expect(store.set).toHaveBeenCalledTimes(0)

      expect(store.delete).toHaveBeenCalledTimes(1)
      expect(store.delete).toHaveBeenCalledWith('downloads')
    })
  })
})
