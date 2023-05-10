const { app } = require('electron')
const MockDate = require('mockdate')

const { didFinishLoad } = require('../didFinishLoad')

beforeEach(() => {
  MockDate.set('2023-05-01')
  app.isPackaged = true
  app.getPath = jest.fn().mockReturnValue('/Downloads')
})

describe('didFinishLoad', () => {
  describe('when a downloadId is not provided', () => {
    test('shows the window', () => {
      const downloadId = undefined
      const store = {}
      const window = {
        show: jest.fn()
      }

      didFinishLoad({
        downloadId,
        store,
        window
      })

      expect(window.show).toHaveBeenCalledTimes(1)
    })

    test('opens devtools in development', () => {
      app.isPackaged = false

      const downloadId = undefined
      const store = {}
      const window = {
        show: jest.fn(),
        webContents: {
          openDevTools: jest.fn()
        }
      }

      didFinishLoad({
        downloadId,
        store,
        window
      })

      expect(window.show).toHaveBeenCalledTimes(1)
      expect(window.webContents.openDevTools).toHaveBeenCalledTimes(1)
      expect(window.webContents.openDevTools).toHaveBeenCalledWith({ mode: 'detach' })
    })
  })

  describe('when a downloadId is provided', () => {
    test('sends the system default downloads directory to the renderer process', () => {
      const downloadId = 'mock-download-id'
      const store = {
        get: jest.fn().mockReturnValue({
          defaultDownloadLocation: undefined,
          lastDownloadLocation: undefined
        })
      }
      const window = {
        show: jest.fn(),
        webContents: {
          send: jest.fn()
        }
      }

      didFinishLoad({
        downloadId,
        store,
        window
      })

      expect(window.show).toHaveBeenCalledTimes(1)
      expect(window.webContents.send).toHaveBeenCalledTimes(1)
      expect(window.webContents.send).toHaveBeenCalledWith('initializeDownload', {
        downloadId: 'mock-download-id',
        downloadLocation: '/Downloads',
        shouldUseDefaultLocation: false
      })
    })

    test('sends the lastDownloadLocation to the renderer process', () => {
      const downloadId = 'mock-download-id'
      const store = {
        get: jest.fn().mockReturnValue({
          defaultDownloadLocation: undefined,
          lastDownloadLocation: '/mock/last/location'
        })
      }
      const window = {
        show: jest.fn(),
        webContents: {
          send: jest.fn()
        }
      }

      didFinishLoad({
        downloadId,
        store,
        window
      })

      expect(window.show).toHaveBeenCalledTimes(1)
      expect(window.webContents.send).toHaveBeenCalledTimes(1)
      expect(window.webContents.send).toHaveBeenCalledWith('initializeDownload', {
        downloadId: 'mock-download-id',
        downloadLocation: '/mock/last/location',
        shouldUseDefaultLocation: false
      })
    })

    test('sends the defaultDownloadLocation to the renderer process', () => {
      const downloadId = 'mock-download-id'
      const store = {
        get: jest.fn().mockReturnValue({
          defaultDownloadLocation: '/mock/default/location',
          lastDownloadLocation: '/mock/last/location'
        })
      }
      const window = {
        show: jest.fn(),
        webContents: {
          send: jest.fn()
        }
      }

      didFinishLoad({
        downloadId,
        store,
        window
      })

      expect(window.show).toHaveBeenCalledTimes(1)
      expect(window.webContents.send).toHaveBeenCalledTimes(1)
      expect(window.webContents.send).toHaveBeenCalledWith('initializeDownload', {
        downloadId: 'mock-download-id',
        downloadLocation: '/mock/default/location',
        shouldUseDefaultLocation: true
      })
    })
  })
})
