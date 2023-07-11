import CurrentDownloadItems from '../currentDownloadItems'

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
      const filename = 'test-file.png'

      const currentDownloadItems = new CurrentDownloadItems()

      currentDownloadItems.addItem(downloadId, filename, mockItem)

      expect(currentDownloadItems.getItem(downloadId, filename)).toEqual(mockItem)
    })
  })

  describe('cancelItem', () => {
    describe('when a filename is provided', () => {
      test('cancels a download item', () => {
        const downloadId = 'mock-download-id'
        const filename = 'test-file.png'

        const currentDownloadItems = new CurrentDownloadItems()

        currentDownloadItems.addItem(downloadId, filename, mockItem)
        currentDownloadItems.cancelItem(downloadId, filename)

        expect(mockItem.cancel).toHaveBeenCalledTimes(1)

        expect(currentDownloadItems.getItem(downloadId, filename)).toEqual(undefined)
      })

      test('does not cancel a download item that does not exist', () => {
        const downloadId = 'mock-download-id'
        const filename = 'test-file.png'

        const currentDownloadItems = new CurrentDownloadItems()

        currentDownloadItems.addItem(downloadId, filename, mockItem)
        currentDownloadItems.cancelItem(downloadId, `1-${filename}`)

        expect(mockItem.cancel).toHaveBeenCalledTimes(0)

        expect(currentDownloadItems.getItem(downloadId, filename)).toEqual(mockItem)
      })
    })

    describe('when a filename is not provided', () => {
      test('cancels all download items', () => {
        const downloadId = 'mock-download-id'
        const filename = 'test-file.png'

        const currentDownloadItems = new CurrentDownloadItems()

        currentDownloadItems.addItem(downloadId, `1-${filename}`, mockItem)
        currentDownloadItems.addItem(downloadId, `2-${filename}`, mockItem)
        currentDownloadItems.cancelItem(downloadId, undefined)

        expect(mockItem.cancel).toHaveBeenCalledTimes(2)

        expect(currentDownloadItems.getAllItemsInDownload(downloadId)).toEqual(undefined)
      })

      test('does not cancel a download items that do not exist', () => {
        const downloadId = 'mock-download-id'
        const filename = 'test-file.png'

        const currentDownloadItems = new CurrentDownloadItems()

        currentDownloadItems.addItem(downloadId, `1-${filename}`, mockItem)
        currentDownloadItems.addItem(downloadId, `2-${filename}`, mockItem)
        currentDownloadItems.cancelItem(`${downloadId}1`, undefined)

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
        const filename = 'test-file.png'

        const currentDownloadItems = new CurrentDownloadItems()

        currentDownloadItems.addItem(downloadId, `1-${filename}`, mockItem)
        currentDownloadItems.addItem(`${downloadId}-1`, `2-${filename}`, mockItem)
        currentDownloadItems.cancelItem(undefined, undefined)

        expect(mockItem.cancel).toHaveBeenCalledTimes(2)

        expect(currentDownloadItems.getAllItemsInDownload(downloadId)).toEqual(undefined)
      })
    })
  })

  describe('getItem', () => {
    test('returns a download item', () => {
      const downloadId = 'mock-download-id'
      const filename = 'test-file.png'

      const currentDownloadItems = new CurrentDownloadItems()

      currentDownloadItems.addItem(downloadId, filename, mockItem)

      expect(currentDownloadItems.getItem(downloadId, filename)).toEqual(mockItem)
    })
  })

  describe('getAllItemsInDownload', () => {
    test('returns a download item', () => {
      const downloadId = 'mock-download-id'
      const filename = 'test-file.png'

      const currentDownloadItems = new CurrentDownloadItems()

      currentDownloadItems.addItem(downloadId, `1-${filename}`, mockItem)
      currentDownloadItems.addItem(downloadId, `2-${filename}`, mockItem)

      expect(currentDownloadItems.getAllItemsInDownload(downloadId)).toEqual({
        '1-test-file.png': mockItem,
        '2-test-file.png': mockItem
      })
    })
  })

  describe('getNumberOfDownloads', () => {
    test('returns the number of active download items', () => {
      const downloadId = 'mock-download-id'
      const filename = 'test-file.png'

      const currentDownloadItems = new CurrentDownloadItems()

      currentDownloadItems.addItem(`${downloadId}1`, `${filename}1`, mockItem)
      currentDownloadItems.addItem(`${downloadId}1`, `${filename}2`, mockItem)
      currentDownloadItems.addItem(`${downloadId}2`, `${filename}1`, mockItem)
      currentDownloadItems.addItem(`${downloadId}2`, `${filename}2`, mockItem)

      expect(currentDownloadItems.getNumberOfDownloads(undefined)).toEqual(4)
    })

    test('returns the number of active download items for a downloadId', () => {
      const downloadId = 'mock-download-id'
      const filename = 'test-file.png'

      const currentDownloadItems = new CurrentDownloadItems()

      currentDownloadItems.addItem(`${downloadId}1`, `${filename}1`, mockItem)
      currentDownloadItems.addItem(`${downloadId}1`, `${filename}2`, mockItem)
      currentDownloadItems.addItem(`${downloadId}2`, `${filename}1`, mockItem)
      currentDownloadItems.addItem(`${downloadId}2`, `${filename}2`, mockItem)

      expect(currentDownloadItems.getNumberOfDownloads(`${downloadId}1`)).toEqual(2)
    })
  })

  describe('pauseItem', () => {
    describe('when a filename is provided', () => {
      test('pauses a download item', () => {
        const downloadId = 'mock-download-id'
        const filename = 'test-file.png'

        const currentDownloadItems = new CurrentDownloadItems()

        currentDownloadItems.addItem(downloadId, filename, mockItem)
        currentDownloadItems.pauseItem(downloadId, filename)

        expect(mockItem.pause).toHaveBeenCalledTimes(1)
      })

      test('does not pause a download item that does not exist', () => {
        const downloadId = 'mock-download-id'
        const filename = 'test-file.png'

        const currentDownloadItems = new CurrentDownloadItems()

        currentDownloadItems.addItem(downloadId, filename, mockItem)
        currentDownloadItems.pauseItem(downloadId, `1-${filename}`)

        expect(mockItem.pause).toHaveBeenCalledTimes(0)
      })
    })

    describe('when a filename is not provided', () => {
      test('pauses all download items', () => {
        const downloadId = 'mock-download-id'
        const filename = 'test-file.png'

        const currentDownloadItems = new CurrentDownloadItems()

        currentDownloadItems.addItem(downloadId, `1-${filename}`, mockItem)
        currentDownloadItems.addItem(downloadId, `2-${filename}`, mockItem)
        currentDownloadItems.pauseItem(downloadId, undefined)

        expect(mockItem.pause).toHaveBeenCalledTimes(2)
      })

      test('does not pause download items that do not exist', () => {
        const downloadId = 'mock-download-id'
        const filename = 'test-file.png'

        const currentDownloadItems = new CurrentDownloadItems()

        currentDownloadItems.addItem(downloadId, `1-${filename}`, mockItem)
        currentDownloadItems.addItem(downloadId, `2-${filename}`, mockItem)
        currentDownloadItems.pauseItem(`${downloadId}1`, undefined)

        expect(mockItem.pause).toHaveBeenCalledTimes(0)
      })
    })

    describe('when a downloadId is not provided', () => {
      test('pauses all download items', () => {
        const downloadId = 'mock-download-id'
        const filename = 'test-file.png'

        const currentDownloadItems = new CurrentDownloadItems()

        currentDownloadItems.addItem(downloadId, `1-${filename}`, mockItem)
        currentDownloadItems.addItem(`${downloadId}-1`, `2-${filename}`, mockItem)
        currentDownloadItems.pauseItem(undefined, undefined)

        expect(mockItem.pause).toHaveBeenCalledTimes(2)
      })
    })
  })

  describe('removeItem', () => {
    describe('when a filename is provided', () => {
      test('removes a download item from the list', () => {
        const downloadId = 'mock-download-id'
        const filename = 'test-file.png'

        const currentDownloadItems = new CurrentDownloadItems()

        currentDownloadItems.addItem(downloadId, filename, mockItem)
        currentDownloadItems.removeItem(downloadId, filename)

        expect(currentDownloadItems.getItem(downloadId, filename)).toEqual(undefined)
      })
    })

    describe('when a filename is not provided', () => {
      test('removes all download items if a filename is not provided', () => {
        const downloadId = 'mock-download-id'
        const filename = 'test-file.png'

        const currentDownloadItems = new CurrentDownloadItems()

        currentDownloadItems.addItem(downloadId, `1-${filename}`, mockItem)
        currentDownloadItems.addItem(downloadId, `2-${filename}`, mockItem)
        currentDownloadItems.removeItem(downloadId, undefined)

        expect(currentDownloadItems.getAllItemsInDownload(downloadId)).toEqual(undefined)
      })
    })

    describe('when a downloadId is not provided', () => {
      test('removes all download items', () => {
        const downloadId = 'mock-download-id'
        const filename = 'test-file.png'

        const currentDownloadItems = new CurrentDownloadItems()

        currentDownloadItems.addItem(downloadId, `1-${filename}`, mockItem)
        currentDownloadItems.addItem(`${downloadId}-1`, `2-${filename}`, mockItem)
        currentDownloadItems.removeItem(undefined, undefined)

        expect(currentDownloadItems.getAllItemsInDownload(downloadId)).toEqual(undefined)
      })
    })

    test('logs a message when the item does not exist', () => {
      const consoleMock = jest.spyOn(console, 'log').mockImplementation(() => {})
      const downloadId = 'mock-download-id'
      const filename = 'test-file.png'

      const currentDownloadItems = new CurrentDownloadItems()

      currentDownloadItems.removeItem(downloadId, filename)

      expect(consoleMock).toHaveBeenCalledTimes(1)
      expect(consoleMock).toHaveBeenCalledWith('Item: mock-download-id.test-file.png did not exist.')
    })
  })

  describe('resumeItem', () => {
    describe('when a filename is provided', () => {
      test('resumes a download item', () => {
        const downloadId = 'mock-download-id'
        const filename = 'test-file.png'

        const currentDownloadItems = new CurrentDownloadItems()

        currentDownloadItems.addItem(downloadId, filename, mockItem)
        currentDownloadItems.resumeItem(downloadId, filename)

        expect(mockItem.resume).toHaveBeenCalledTimes(1)
      })

      test('does not resume a download item that does not exist', () => {
        const downloadId = 'mock-download-id'
        const filename = 'test-file.png'

        const currentDownloadItems = new CurrentDownloadItems()

        currentDownloadItems.addItem(downloadId, filename, mockItem)
        currentDownloadItems.resumeItem(downloadId, `1-${filename}`)

        expect(mockItem.resume).toHaveBeenCalledTimes(0)
      })
    })

    describe('when a filename is not provided', () => {
      test('resumes all download items', () => {
        const downloadId = 'mock-download-id'
        const filename = 'test-file.png'

        const currentDownloadItems = new CurrentDownloadItems()

        currentDownloadItems.addItem(downloadId, `1-${filename}`, mockItem)
        currentDownloadItems.addItem(downloadId, `2-${filename}`, mockItem)
        currentDownloadItems.resumeItem(downloadId, undefined)

        expect(mockItem.resume).toHaveBeenCalledTimes(2)
      })

      test('does not resume download items that do not exist', () => {
        const downloadId = 'mock-download-id'
        const filename = 'test-file.png'

        const currentDownloadItems = new CurrentDownloadItems()

        currentDownloadItems.addItem(downloadId, `1-${filename}`, mockItem)
        currentDownloadItems.addItem(downloadId, `2-${filename}`, mockItem)
        currentDownloadItems.resumeItem(`${downloadId}1`, undefined)

        expect(mockItem.resume).toHaveBeenCalledTimes(0)
      })
    })

    describe('when a downloadId is not provided', () => {
      test('resumes all download items', () => {
        const downloadId = 'mock-download-id'
        const filename = 'test-file.png'

        const currentDownloadItems = new CurrentDownloadItems()

        currentDownloadItems.addItem(downloadId, `1-${filename}`, mockItem)
        currentDownloadItems.addItem(`${downloadId}-1`, `2-${filename}`, mockItem)
        currentDownloadItems.resumeItem(undefined, undefined)

        expect(mockItem.resume).toHaveBeenCalledTimes(2)
      })
    })
  })
})
