const CurrentDownloadItems = require('../currentDownloadItems')

const mockItem = {
  mock: 'downloadItem',
  cancel: jest.fn(),
  pause: jest.fn(),
  resume: jest.fn()
}

describe('currentDownloadItems', () => {
  describe('addItem', () => {
    test('adds a download item to the list', () => {
      const downloadId = 'mock-download-id'
      const name = 'test-file.png'

      const currentDownloadItems = new CurrentDownloadItems()

      currentDownloadItems.addItem(downloadId, name, mockItem)

      expect(currentDownloadItems.getItem(downloadId, name)).toEqual(mockItem)
    })
  })

  describe('cancelItem', () => {
    describe('when a name is provided', () => {
      test('cancels a download item', () => {
        const downloadId = 'mock-download-id'
        const name = 'test-file.png'

        const currentDownloadItems = new CurrentDownloadItems()

        currentDownloadItems.addItem(downloadId, name, mockItem)
        currentDownloadItems.cancelItem(downloadId, name)

        expect(mockItem.cancel).toHaveBeenCalledTimes(1)

        expect(currentDownloadItems.getItem(downloadId, name)).toEqual(undefined)
      })

      test('does not cancel a download item that does not exist', () => {
        const downloadId = 'mock-download-id'
        const name = 'test-file.png'

        const currentDownloadItems = new CurrentDownloadItems()

        currentDownloadItems.addItem(downloadId, name, mockItem)
        currentDownloadItems.cancelItem(downloadId, `1-${name}`)

        expect(mockItem.cancel).toHaveBeenCalledTimes(0)

        expect(currentDownloadItems.getItem(downloadId, name)).toEqual(mockItem)
      })
    })

    describe('when a name is not provided', () => {
      test('cancels all download items', () => {
        const downloadId = 'mock-download-id'
        const name = 'test-file.png'

        const currentDownloadItems = new CurrentDownloadItems()

        currentDownloadItems.addItem(downloadId, `1-${name}`, mockItem)
        currentDownloadItems.addItem(downloadId, `2-${name}`, mockItem)
        currentDownloadItems.cancelItem(downloadId)

        expect(mockItem.cancel).toHaveBeenCalledTimes(2)

        expect(currentDownloadItems.getAllItemsInDownload(downloadId)).toEqual(undefined)
      })

      test('does not cancel a download items that do not exist', () => {
        const downloadId = 'mock-download-id'
        const name = 'test-file.png'

        const currentDownloadItems = new CurrentDownloadItems()

        currentDownloadItems.addItem(downloadId, `1-${name}`, mockItem)
        currentDownloadItems.addItem(downloadId, `2-${name}`, mockItem)
        currentDownloadItems.cancelItem(`${downloadId}1`)

        expect(mockItem.cancel).toHaveBeenCalledTimes(0)

        expect(currentDownloadItems.getAllItemsInDownload(downloadId)).toEqual({
          '1-test-file.png': mockItem,
          '2-test-file.png': mockItem
        })
      })
    })

    describe('when a downloadId is not provided', () => {
      test('cancels all download items', () => {
        const downloadId = 'mock-download-id'
        const name = 'test-file.png'

        const currentDownloadItems = new CurrentDownloadItems()

        currentDownloadItems.addItem(downloadId, `1-${name}`, mockItem)
        currentDownloadItems.addItem(`${downloadId}-1`, `2-${name}`, mockItem)
        currentDownloadItems.cancelItem()

        expect(mockItem.cancel).toHaveBeenCalledTimes(2)

        expect(currentDownloadItems.getAllItemsInDownload(downloadId)).toEqual(undefined)
      })
    })
  })

  describe('getItem', () => {
    test('returns a download item', () => {
      const downloadId = 'mock-download-id'
      const name = 'test-file.png'

      const currentDownloadItems = new CurrentDownloadItems()

      currentDownloadItems.addItem(downloadId, name, mockItem)

      expect(currentDownloadItems.getItem(downloadId, name)).toEqual(mockItem)
    })
  })

  describe('getAllItemsInDownload', () => {
    test('returns a download item', () => {
      const downloadId = 'mock-download-id'
      const name = 'test-file.png'

      const currentDownloadItems = new CurrentDownloadItems()

      currentDownloadItems.addItem(downloadId, `1-${name}`, mockItem)
      currentDownloadItems.addItem(downloadId, `2-${name}`, mockItem)

      expect(currentDownloadItems.getAllItemsInDownload(downloadId)).toEqual({
        '1-test-file.png': mockItem,
        '2-test-file.png': mockItem
      })
    })
  })

  describe('getNumberOfDownloads', () => {
    test('returns the number of active download items', () => {
      const downloadId = 'mock-download-id'
      const name = 'test-file.png'

      const currentDownloadItems = new CurrentDownloadItems()

      currentDownloadItems.addItem(`${downloadId}1`, `${name}1`, mockItem)
      currentDownloadItems.addItem(`${downloadId}1`, `${name}2`, mockItem)
      currentDownloadItems.addItem(`${downloadId}2`, `${name}1`, mockItem)
      currentDownloadItems.addItem(`${downloadId}2`, `${name}2`, mockItem)

      expect(currentDownloadItems.getNumberOfDownloads()).toEqual(4)
    })

    test('returns the number of active download items for a downloadId', () => {
      const downloadId = 'mock-download-id'
      const name = 'test-file.png'

      const currentDownloadItems = new CurrentDownloadItems()

      currentDownloadItems.addItem(`${downloadId}1`, `${name}1`, mockItem)
      currentDownloadItems.addItem(`${downloadId}1`, `${name}2`, mockItem)
      currentDownloadItems.addItem(`${downloadId}2`, `${name}1`, mockItem)
      currentDownloadItems.addItem(`${downloadId}2`, `${name}2`, mockItem)

      expect(currentDownloadItems.getNumberOfDownloads(`${downloadId}1`)).toEqual(2)
    })
  })

  describe('pauseItem', () => {
    describe('when a name is provided', () => {
      test('pauses a download item', () => {
        const downloadId = 'mock-download-id'
        const name = 'test-file.png'

        const currentDownloadItems = new CurrentDownloadItems()

        currentDownloadItems.addItem(downloadId, name, mockItem)
        currentDownloadItems.pauseItem(downloadId, name)

        expect(mockItem.pause).toHaveBeenCalledTimes(1)
      })

      test('does not pause a download item that does not exist', () => {
        const downloadId = 'mock-download-id'
        const name = 'test-file.png'

        const currentDownloadItems = new CurrentDownloadItems()

        currentDownloadItems.addItem(downloadId, name, mockItem)
        currentDownloadItems.pauseItem(downloadId, `1-${name}`)

        expect(mockItem.pause).toHaveBeenCalledTimes(0)
      })
    })

    describe('when a name is not provided', () => {
      test('pauses all download items', () => {
        const downloadId = 'mock-download-id'
        const name = 'test-file.png'

        const currentDownloadItems = new CurrentDownloadItems()

        currentDownloadItems.addItem(downloadId, `1-${name}`, mockItem)
        currentDownloadItems.addItem(downloadId, `2-${name}`, mockItem)
        currentDownloadItems.pauseItem(downloadId)

        expect(mockItem.pause).toHaveBeenCalledTimes(2)
      })

      test('does not pause download items that do not exist', () => {
        const downloadId = 'mock-download-id'
        const name = 'test-file.png'

        const currentDownloadItems = new CurrentDownloadItems()

        currentDownloadItems.addItem(downloadId, `1-${name}`, mockItem)
        currentDownloadItems.addItem(downloadId, `2-${name}`, mockItem)
        currentDownloadItems.pauseItem(`${downloadId}1`)

        expect(mockItem.pause).toHaveBeenCalledTimes(0)
      })
    })

    describe('when a downloadId is not provided', () => {
      test('pauses all download items', () => {
        const downloadId = 'mock-download-id'
        const name = 'test-file.png'

        const currentDownloadItems = new CurrentDownloadItems()

        currentDownloadItems.addItem(downloadId, `1-${name}`, mockItem)
        currentDownloadItems.addItem(`${downloadId}-1`, `2-${name}`, mockItem)
        currentDownloadItems.pauseItem()

        expect(mockItem.pause).toHaveBeenCalledTimes(2)
      })
    })
  })

  describe('removeItem', () => {
    describe('when a name is provided', () => {
      test('removes a download item from the list', () => {
        const downloadId = 'mock-download-id'
        const name = 'test-file.png'

        const currentDownloadItems = new CurrentDownloadItems()

        currentDownloadItems.addItem(downloadId, name, mockItem)
        currentDownloadItems.removeItem(downloadId, name)

        expect(currentDownloadItems.getItem(downloadId, name)).toEqual(undefined)
      })
    })

    describe('when a name is not provided', () => {
      test('removes all download items if a name is not provided', () => {
        const downloadId = 'mock-download-id'
        const name = 'test-file.png'

        const currentDownloadItems = new CurrentDownloadItems()

        currentDownloadItems.addItem(downloadId, `1-${name}`, mockItem)
        currentDownloadItems.addItem(downloadId, `2-${name}`, mockItem)
        currentDownloadItems.removeItem(downloadId)

        expect(currentDownloadItems.getAllItemsInDownload(downloadId, name)).toEqual(undefined)
      })
    })

    describe('when a downloadId is not provided', () => {
      test('removes all download items', () => {
        const downloadId = 'mock-download-id'
        const name = 'test-file.png'

        const currentDownloadItems = new CurrentDownloadItems()

        currentDownloadItems.addItem(downloadId, `1-${name}`, mockItem)
        currentDownloadItems.addItem(`${downloadId}-1`, `2-${name}`, mockItem)
        currentDownloadItems.removeItem()

        expect(currentDownloadItems.getAllItemsInDownload(downloadId, name)).toEqual(undefined)
      })
    })
  })

  describe('resumeItem', () => {
    describe('when a name is provided', () => {
      test('resumes a download item', () => {
        const downloadId = 'mock-download-id'
        const name = 'test-file.png'

        const currentDownloadItems = new CurrentDownloadItems()

        currentDownloadItems.addItem(downloadId, name, mockItem)
        currentDownloadItems.resumeItem(downloadId, name)

        expect(mockItem.resume).toHaveBeenCalledTimes(1)
      })

      test('does not resume a download item that does not exist', () => {
        const downloadId = 'mock-download-id'
        const name = 'test-file.png'

        const currentDownloadItems = new CurrentDownloadItems()

        currentDownloadItems.addItem(downloadId, name, mockItem)
        currentDownloadItems.resumeItem(downloadId, `1-${name}`)

        expect(mockItem.resume).toHaveBeenCalledTimes(0)
      })
    })

    describe('when a name is not provided', () => {
      test('resumes all download items', () => {
        const downloadId = 'mock-download-id'
        const name = 'test-file.png'

        const currentDownloadItems = new CurrentDownloadItems()

        currentDownloadItems.addItem(downloadId, `1-${name}`, mockItem)
        currentDownloadItems.addItem(downloadId, `2-${name}`, mockItem)
        currentDownloadItems.resumeItem(downloadId)

        expect(mockItem.resume).toHaveBeenCalledTimes(2)
      })

      test('does not resume download items that do not exist', () => {
        const downloadId = 'mock-download-id'
        const name = 'test-file.png'

        const currentDownloadItems = new CurrentDownloadItems()

        currentDownloadItems.addItem(downloadId, `1-${name}`, mockItem)
        currentDownloadItems.addItem(downloadId, `2-${name}`, mockItem)
        currentDownloadItems.resumeItem(`${downloadId}1`)

        expect(mockItem.resume).toHaveBeenCalledTimes(0)
      })
    })

    describe('when a downloadId is not provided', () => {
      test('resumes all download items', () => {
        const downloadId = 'mock-download-id'
        const name = 'test-file.png'

        const currentDownloadItems = new CurrentDownloadItems()

        currentDownloadItems.addItem(downloadId, `1-${name}`, mockItem)
        currentDownloadItems.addItem(`${downloadId}-1`, `2-${name}`, mockItem)
        currentDownloadItems.resumeItem()

        expect(mockItem.resume).toHaveBeenCalledTimes(2)
      })
    })
  })
})
