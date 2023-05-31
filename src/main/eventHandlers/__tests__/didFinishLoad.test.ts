// @ts-nocheck

import { app } from 'electron'
import MockDate from 'mockdate'

import didFinishLoad from '../didFinishLoad'

beforeEach(() => {
  MockDate.set('2023-05-01')
  app.isPackaged = true
  app.getPath = jest.fn().mockReturnValue('/Downloads')
})

describe('didFinishLoad', () => {
  describe('when downloadIds is not provided', () => {
    test('shows the window', () => {
      const downloadIds = undefined
      const store = {}
      const appWindow = {
        show: jest.fn()
      }

      didFinishLoad({
        downloadIds,
        store,
        appWindow
      })

      expect(appWindow.show).toHaveBeenCalledTimes(1)
    })

    test('opens devtools in development', () => {
      app.isPackaged = false

      const downloadIds = undefined
      const store = {}
      const appWindow = {
        show: jest.fn(),
        webContents: {
          openDevTools: jest.fn()
        }
      }

      didFinishLoad({
        downloadIds,
        store,
        appWindow
      })

      expect(appWindow.show).toHaveBeenCalledTimes(1)
      expect(appWindow.webContents.openDevTools).toHaveBeenCalledTimes(1)
      expect(appWindow.webContents.openDevTools).toHaveBeenCalledWith({ mode: 'detach' })
    })
  })

  describe('when downloadIds is provided', () => {
    test('sends the system default downloads directory to the renderer process', () => {
      const downloadIds = 'mock-download-id'
      const store = {
        get: jest.fn().mockReturnValue({
          defaultDownloadLocation: undefined,
          lastDownloadLocation: undefined
        })
      }
      const appWindow = {
        show: jest.fn(),
        webContents: {
          send: jest.fn()
        }
      }

      didFinishLoad({
        downloadIds,
        store,
        appWindow
      })

      expect(appWindow.show).toHaveBeenCalledTimes(1)
      expect(appWindow.webContents.send).toHaveBeenCalledTimes(1)
      expect(appWindow.webContents.send).toHaveBeenCalledWith('initializeDownload', {
        downloadIds: 'mock-download-id',
        downloadLocation: '/Downloads',
        shouldUseDefaultLocation: false
      })
    })

    test('sends the lastDownloadLocation to the renderer process', () => {
      const downloadIds = 'mock-download-id'
      const store = {
        get: jest.fn().mockReturnValue({
          defaultDownloadLocation: undefined,
          lastDownloadLocation: '/mock/last/location'
        })
      }
      const appWindow = {
        show: jest.fn(),
        webContents: {
          send: jest.fn()
        }
      }

      didFinishLoad({
        downloadIds,
        store,
        appWindow
      })

      expect(appWindow.show).toHaveBeenCalledTimes(1)
      expect(appWindow.webContents.send).toHaveBeenCalledTimes(1)
      expect(appWindow.webContents.send).toHaveBeenCalledWith('initializeDownload', {
        downloadIds: 'mock-download-id',
        downloadLocation: '/mock/last/location',
        shouldUseDefaultLocation: false
      })
    })

    test('sends the defaultDownloadLocation to the renderer process', () => {
      const downloadIds = 'mock-download-id'
      const store = {
        get: jest.fn().mockReturnValue({
          defaultDownloadLocation: '/mock/default/location',
          lastDownloadLocation: '/mock/last/location'
        })
      }
      const appWindow = {
        show: jest.fn(),
        webContents: {
          send: jest.fn()
        }
      }

      didFinishLoad({
        downloadIds,
        store,
        appWindow
      })

      expect(appWindow.show).toHaveBeenCalledTimes(1)
      expect(appWindow.webContents.send).toHaveBeenCalledTimes(1)
      expect(appWindow.webContents.send).toHaveBeenCalledWith('initializeDownload', {
        downloadIds: 'mock-download-id',
        downloadLocation: '/mock/default/location',
        shouldUseDefaultLocation: true
      })
    })
  })
})
