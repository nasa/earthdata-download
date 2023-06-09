import resumeDownloadItem from '../resumeDownloadItem'

describe('resumeDownloadItem', () => {
  describe('when downloadId and name are provided', () => {
    test('calls currentDownloadItems.resumeItem', () => {
      const currentDownloadItems = {
        resumeItem: jest.fn()
      }
      const info = {
        downloadId: 'mock-download-id',
        name: 'mock-filename.png'
      }
      const store = {}

      resumeDownloadItem({
        currentDownloadItems,
        info,
        store
      })

      expect(currentDownloadItems.resumeItem).toHaveBeenCalledTimes(1)
      expect(currentDownloadItems.resumeItem).toHaveBeenCalledWith('mock-download-id', 'mock-filename.png')
    })
  })

  describe('when only downloadId is provided', () => {
    describe('when the download does not have files', () => {
      test('calls currentDownloadItems.resumeItem and updates the store', () => {
        const currentDownloadItems = {
          resumeItem: jest.fn()
        }
        const info = {
          downloadId: 'mock-download-id'
        }
        const store = {
          get: jest.fn()
            .mockReturnValue({
              files: {}
            }),
          set: jest.fn()
        }

        resumeDownloadItem({
          currentDownloadItems,
          info,
          store
        })

        expect(currentDownloadItems.resumeItem).toHaveBeenCalledTimes(1)
        expect(currentDownloadItems.resumeItem).toHaveBeenCalledWith('mock-download-id', undefined)

        expect(store.get).toHaveBeenCalledTimes(1)
        expect(store.get).toHaveBeenCalledWith('downloads.mock-download-id')

        expect(store.set).toHaveBeenCalledTimes(1)
        expect(store.set).toHaveBeenCalledWith('downloads.mock-download-id.state', 'PENDING')
      })
    })

    describe('when the download has files', () => {
      test('calls currentDownloadItems.resumeItem and updates the store', () => {
        const currentDownloadItems = {
          resumeItem: jest.fn()
        }
        const info = {
          downloadId: 'mock-download-id'
        }
        const store = {
          get: jest.fn()
            .mockReturnValue({
              files: {
                'file1.png': {
                  url: 'http://example.com/file1.png',
                  state: 'ACTIVE',
                  percent: 42
                }
              }
            }),
          set: jest.fn()
        }

        resumeDownloadItem({
          currentDownloadItems,
          info,
          store
        })

        expect(currentDownloadItems.resumeItem).toHaveBeenCalledTimes(1)
        expect(currentDownloadItems.resumeItem).toHaveBeenCalledWith('mock-download-id', undefined)

        expect(store.get).toHaveBeenCalledTimes(1)
        expect(store.get).toHaveBeenCalledWith('downloads.mock-download-id')

        expect(store.set).toHaveBeenCalledTimes(1)
        expect(store.set).toHaveBeenCalledWith('downloads.mock-download-id.state', 'ACTIVE')
      })
    })
  })

  describe('when no downloadId or name is provided', () => {
    test('calls currentDownloadItems.resumeItem and updates the store', () => {
      const currentDownloadItems = {
        resumeItem: jest.fn()
      }
      const info = {}
      const store = {
        get: jest.fn()
          .mockReturnValue({
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
                  state: 'PAUSED',
                  percent: 42
                }
              },
              state: 'PAUSED'
            },
            download3: {
              files: {},
              state: 'PAUSED'
            }
          }),
        set: jest.fn()
      }

      resumeDownloadItem({
        currentDownloadItems,
        info,
        store
      })

      expect(currentDownloadItems.resumeItem).toHaveBeenCalledTimes(1)
      expect(currentDownloadItems.resumeItem).toHaveBeenCalledWith(undefined, undefined)

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
              state: 'PAUSED',
              url: 'http://example.com/file2.png'
            }
          },
          state: 'ACTIVE'
        },
        download3: {
          files: {},
          state: 'PENDING'
        }
      })
    })
  })
})
