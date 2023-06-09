import pauseDownloadItem from '../pauseDownloadItem'

describe('pauseDownloadItem', () => {
  describe('when downloadId and name are provided', () => {
    test('calls currentDownloadItems.pauseItem', () => {
      const currentDownloadItems = {
        pauseItem: jest.fn()
      }
      const info = {
        downloadId: 'mock-download-id',
        name: 'mock-filename.png'
      }
      const store = {
        get: jest.fn(),
        set: jest.fn()
      }

      pauseDownloadItem({
        currentDownloadItems,
        info,
        store
      })

      expect(currentDownloadItems.pauseItem).toHaveBeenCalledTimes(1)
      expect(currentDownloadItems.pauseItem).toHaveBeenCalledWith('mock-download-id', 'mock-filename.png')
    })
  })

  describe('when only downloadId is provided', () => {
    test('calls currentDownloadItems.pauseItem and updates the store', () => {
      const currentDownloadItems = {
        pauseItem: jest.fn()
      }
      const info = {
        downloadId: 'mock-download-id'
      }
      const store = {
        get: jest.fn(),
        set: jest.fn()
      }

      pauseDownloadItem({
        currentDownloadItems,
        info,
        store
      })

      expect(currentDownloadItems.pauseItem).toHaveBeenCalledTimes(1)
      expect(currentDownloadItems.pauseItem).toHaveBeenCalledWith('mock-download-id', undefined)

      expect(store.set).toHaveBeenCalledTimes(1)
      expect(store.set).toHaveBeenCalledWith('downloads.mock-download-id.state', 'PAUSED')
    })
  })

  describe('when no downloadId or name is provided', () => {
    test('calls currentDownloadItems.pauseItem and updates the store', () => {
      const currentDownloadItems = {
        pauseItem: jest.fn()
      }
      const info = {}
      const store = {
        get: jest.fn().mockReturnValue({
          download1: {
            files: {
              'file1.png': {
                url: 'http://example.com/file1.png',
                state: 'COMPLETE',
                percent: 100
              }
            },
            state: 'COMPLETE'
          },
          download2: {
            files: {
              'file2.png': {
                url: 'http://example.com/file2.png',
                state: 'ACTIVE',
                percent: 42
              }
            },
            state: 'ACTIVE'
          },
          download3: {
            files: {},
            state: 'PENDING'
          }
        }),
        set: jest.fn()
      }

      pauseDownloadItem({
        currentDownloadItems,
        info,
        store
      })

      expect(currentDownloadItems.pauseItem).toHaveBeenCalledTimes(1)
      expect(currentDownloadItems.pauseItem).toHaveBeenCalledWith(undefined, undefined)

      expect(store.get).toHaveBeenCalledTimes(1)
      expect(store.get).toHaveBeenCalledWith('downloads')

      expect(store.set).toHaveBeenCalledTimes(1)
      expect(store.set).toHaveBeenCalledWith('downloads', {
        download1: {
          files: {
            'file1.png': {
              percent: 100,
              state: 'COMPLETE',
              url: 'http://example.com/file1.png'
            }
          },
          state: 'COMPLETE'
        },
        download2: {
          files: {
            'file2.png': {
              percent: 42,
              state: 'ACTIVE',
              url: 'http://example.com/file2.png'
            }
          },
          state: 'PAUSED'
        },
        download3: {
          files: {},
          state: 'PAUSED'
        }
      })
    })
  })
})
