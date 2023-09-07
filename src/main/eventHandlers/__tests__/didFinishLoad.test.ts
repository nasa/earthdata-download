// @ts-nocheck

import { app } from 'electron'

import didFinishLoad from '../didFinishLoad'

import startPendingDownloads from '../../utils/startPendingDownloads'

import downloadStates from '../../../app/constants/downloadStates'

jest.mock('../../utils/startPendingDownloads')

jest.mock(
  'electron',
  () => {
    const mockApp = {
      isPackaged: false
    }

    return {
      app: mockApp
    }
  },
  { virtual: true }
)

jest.mock('node-fetch', () => ({
  __esModule: true,
  default: jest.fn()
}))

describe('did-finish-load', () => {
  describe('when the app is not packaged', () => {
    test('opens the app window', async () => {
      app.isPackaged = false

      const appWindow = {
        show: jest.fn(),
        webContents: {
          openDevTools: jest.fn()
        },
        minimize: jest.fn(),
        unmaximize: jest.fn(),
        maximize: jest.fn(),
        close: jest.fn()
      }
      const autoUpdater = {
        checkForUpdates: jest.fn(),
        forceDevUpdateConfig: false
      }
      const database = {
        updateFilesWhere: jest.fn().mockResolvedValue([]),
        deletePausesByDownloadIdAndFilename: jest.fn()
      }
      const setUpdateAvailable = jest.fn()

      await didFinishLoad({
        appWindow,
        autoUpdater,
        database,
        setUpdateAvailable
      })

      expect(appWindow.show).toHaveBeenCalledTimes(1)
      expect(autoUpdater.checkForUpdates).toHaveBeenCalledTimes(1)

      expect(database.updateFilesWhere).toHaveBeenCalledTimes(1)
      expect(database.updateFilesWhere).toHaveBeenCalledWith({
        state: downloadStates.paused
      }, {
        errors: null,
        percent: 0,
        receivedBytes: null,
        state: downloadStates.pending,
        timeEnd: null,
        timeStart: null,
        totalBytes: null
      })

      expect(database.deletePausesByDownloadIdAndFilename).toHaveBeenCalledTimes(0)

      expect(appWindow.webContents.openDevTools).toHaveBeenCalledTimes(1)
      expect(appWindow.webContents.openDevTools).toHaveBeenCalledWith({ mode: 'detach' })

      expect(setUpdateAvailable).toHaveBeenCalledTimes(1)
      expect(setUpdateAvailable).toHaveBeenCalledWith(false)

      expect(startPendingDownloads).toHaveBeenCalledTimes(1)
      expect(startPendingDownloads).toHaveBeenCalledWith({
        appWindow,
        database
      })
    })
  })

  describe('when the app is packaged', () => {
    test('opens the app window', async () => {
      app.isPackaged = true

      const appWindow = {
        show: jest.fn(),
        webContents: {
          openDevTools: jest.fn()
        },
        minimize: jest.fn(),
        unmaximize: jest.fn(),
        maximize: jest.fn(),
        close: jest.fn()
      }
      const autoUpdater = {
        checkForUpdates: jest.fn(),
        forceDevUpdateConfig: false
      }
      const database = {
        updateFilesWhere: jest.fn().mockResolvedValue([{
          downloadId: 123,
          filename: 'mock-filename'
        }]),
        deletePausesByDownloadIdAndFilename: jest.fn()
      }
      const setUpdateAvailable = jest.fn()

      await didFinishLoad({
        appWindow,
        autoUpdater,
        database,
        setUpdateAvailable
      })

      expect(appWindow.show).toHaveBeenCalledTimes(1)
      expect(autoUpdater.checkForUpdates).toHaveBeenCalledTimes(1)

      expect(database.updateFilesWhere).toHaveBeenCalledTimes(1)
      expect(database.updateFilesWhere).toHaveBeenCalledWith({
        state: downloadStates.paused
      }, {
        errors: null,
        percent: 0,
        receivedBytes: null,
        state: downloadStates.pending,
        timeEnd: null,
        timeStart: null,
        totalBytes: null
      })

      expect(database.deletePausesByDownloadIdAndFilename).toHaveBeenCalledTimes(1)
      expect(database.deletePausesByDownloadIdAndFilename).toHaveBeenCalledWith(123, 'mock-filename')

      expect(appWindow.webContents.openDevTools).toHaveBeenCalledTimes(0)
      expect(setUpdateAvailable).toHaveBeenCalledTimes(0)
      expect(startPendingDownloads).toHaveBeenCalledTimes(0)
    })
  })
})
