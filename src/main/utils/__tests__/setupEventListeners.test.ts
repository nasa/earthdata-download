// @ts-nocheck

import {
  app,
  dialog,
  ipcRenderer
} from 'electron'

import setupEventListeners from '../setupEventListeners'

import beforeQuit from '../../eventHandlers/beforeQuit'
import beginDownload from '../../eventHandlers/beginDownload'
import cancelDownloadItem from '../../eventHandlers/cancelDownloadItem'
import cancelErroredDownloadItem from '../../eventHandlers/cancelErroredDownloadItem'
import chooseDownloadLocation from '../../eventHandlers/chooseDownloadLocation'
import clearDownload from '../../eventHandlers/clearDownload'
import copyDownloadPath from '../../eventHandlers/copyDownloadPath'
import deleteDownload from '../../eventHandlers/deleteDownload'
import deleteDownloadHistory from '../../eventHandlers/deleteDownloadHistory'
import didFinishLoad from '../../eventHandlers/didFinishLoad'
import getPreferenceFieldValue from '../../eventHandlers/getPreferenceFieldValue'
import openDownloadFolder from '../../eventHandlers/openDownloadFolder'
import pauseDownloadItem from '../../eventHandlers/pauseDownloadItem'
import requestDownloadsProgress from '../../eventHandlers/requestDownloadsProgress'
import requestFilesProgress from '../../eventHandlers/requestFilesProgress'
import restartDownload from '../../eventHandlers/restartDownload'
import resumeDownloadItem from '../../eventHandlers/resumeDownloadItem'
import retryErroredDownloadItem from '../../eventHandlers/retryErroredDownloadItem'
import sendToEula from '../../eventHandlers/sendToEula'
import sendToLogin from '../../eventHandlers/sendToLogin'
import setCancellingDownload from '../../eventHandlers/setCancellingDownload'
import setPendingDeleteDownloadHistory from '../../eventHandlers/setPendingDeleteDownloadHistory'
import setPreferenceFieldValue from '../../eventHandlers/setPreferenceFieldValue'
import setRestartingDownload from '../../eventHandlers/setRestartingDownload'
import startPendingDownloads from '../../utils/startPendingDownloads'
import undoCancellingDownload from '../../eventHandlers/undoCancellingDownload'
import undoClearDownload from '../../eventHandlers/undoClearDownload'
import undoDeleteDownloadHistory from '../../eventHandlers/undoDeleteDownloadHistory'
import undoRestartingDownload from '../../eventHandlers/undoRestartingDownload'
import willDownload from '../../eventHandlers/willDownload'

jest.mock('../../eventHandlers/beforeQuit', () => ({
  __esModule: true,
  default: jest.fn()
    // `when beforeQuit returns true`
    .mockResolvedValueOnce(true)
    // `when beforeQuit returns false`
    .mockResolvedValueOnce(false)
}))

jest.mock('../../utils/metricsLogger.ts', () => ({
  __esModule: true,
  default: jest.fn(() => {})
}))

jest.mock('../../eventHandlers/beginDownload')
jest.mock('../../eventHandlers/cancelDownloadItem')
jest.mock('../../eventHandlers/cancelErroredDownloadItem')
jest.mock('../../eventHandlers/chooseDownloadLocation')
jest.mock('../../eventHandlers/clearDownload')
jest.mock('../../eventHandlers/deleteDownloadHistory')
jest.mock('../../eventHandlers/copyDownloadPath')
jest.mock('../../eventHandlers/deleteDownload')
jest.mock('../../eventHandlers/didFinishLoad')
jest.mock('../../eventHandlers/getPreferenceFieldValue', () => ({
  __esModule: true,
  default: jest.fn().mockResolvedValue('mock getPreferenceFieldValue')
}))

jest.mock('../../eventHandlers/openDownloadFolder')
jest.mock('../../eventHandlers/pauseDownloadItem')
jest.mock('../../eventHandlers/requestDownloadsProgress')
jest.mock('../../eventHandlers/requestFilesProgress')
jest.mock('../../eventHandlers/restartDownload')
jest.mock('../../eventHandlers/resumeDownloadItem')
jest.mock('../../eventHandlers/retryErroredDownloadItem')
jest.mock('../../eventHandlers/sendToEula')
jest.mock('../../eventHandlers/sendToLogin')
jest.mock('../../eventHandlers/setCancellingDownload')
jest.mock('../../eventHandlers/setPendingDeleteDownloadHistory')
jest.mock('../../eventHandlers/setPreferenceFieldValue')
jest.mock('../../eventHandlers/setRestartingDownload')
jest.mock('../../eventHandlers/undoCancellingDownload')
jest.mock('../../eventHandlers/undoClearDownload')
jest.mock('../../eventHandlers/undoDeleteDownloadHistory')
jest.mock('../../eventHandlers/undoRestartingDownload')
jest.mock('../../eventHandlers/willDownload')
jest.mock('../../utils/startPendingDownloads')

jest.mock('node-fetch', () => ({
  __esModule: true,
  default: jest.fn()
}))

const channels = {}

jest.mock(
  'electron',
  () => {
    const mockIpcMain = {
      on: (channel, callback) => {
        channels[channel] = callback
      },
      handle: (channel, callback) => {
        channels[channel] = callback
      }
    }
    const mockIpcRenderer = {
      send: (channel, event, info) => {
        channels[channel](event, info)
      },
      invoke: (channel, event, info) => channels[channel](event, info)
    }
    const mockDialog = {
      showMessageBoxSync: jest.fn()
    }
    const mockApp = {
      on: (channel, callback) => {
        channels[channel] = callback
      },
      send: (channel, data) => {
        channels[channel](data)
      },
      quit: jest.fn(),
      isPackaged: false
    }
    const mockShell = {
      openExternal: jest.fn()
    }

    return {
      app: mockApp,
      ipcMain: mockIpcMain,
      ipcRenderer: mockIpcRenderer,
      dialog: mockDialog,
      shell: mockShell
    }
  },
  { virtual: true }
)

const setup = (overrideAppWindow) => {
  const appWindow = {
    on: (channel, callback) => {
      channels[channel] = callback
    },
    send: (channel, data) => {
      channels[channel](data)
    },
    show: jest.fn(),
    webContents: {
      once: (channel, callback) => {
        channels[channel] = callback
      },
      send: (channel, data) => {
        try {
          channels[channel](data)
        } catch (e) { /* Empty */ }
      },
      session: {
        on: (channel, callback) => {
          channels[channel] = callback
        },
        send: (channel, event, item, webContents) => {
          channels[channel](event, item, webContents)
        }
      },
      setWindowOpenHandler: jest.fn(),
      openDevTools: jest.fn()
    },
    minimize: jest.fn(),
    unmaximize: jest.fn(),
    maximize: jest.fn(),
    close: jest.fn()
  }
  const autoUpdater = {
    on: (channel, callback) => {
      channels[channel] = callback
    },
    send: (channel, data) => {
      channels[channel](data)
    },
    quitAndInstall: jest.fn(),
    checkForUpdates: jest.fn(),
    forceDevUpdateConfig: false
  }
  const currentDownloadItems = {}
  const database = {
    updateFilesWhere: jest.fn(),
    updateDownloadsWhereIn: jest.fn()
  }
  const downloadIdContext = {}
  const downloadsWaitingForAuth = {}
  const downloadsWaitingForEula = {}
  const setUpdateAvailable = jest.fn()

  setupEventListeners({
    appWindow: {
      ...appWindow,
      ...overrideAppWindow
    },
    autoUpdater,
    currentDownloadItems,
    database,
    downloadIdContext,
    downloadsWaitingForAuth,
    downloadsWaitingForEula,
    setUpdateAvailable
  })

  return {
    appWindow,
    autoUpdater,
    currentDownloadItems,
    database,
    downloadIdContext,
    downloadsWaitingForAuth,
    downloadsWaitingForEula,
    setUpdateAvailable
  }
}

describe('setupEventListeners', () => {
  describe('resize', () => {
    test('calls appWindow.minimize', () => {
      const { appWindow } = setup({
        isMaximized: jest.fn().mockReturnValue(true)
      })

      appWindow.webContents.send = jest.fn()

      appWindow.send('resize')

      expect(appWindow.webContents.send).toHaveBeenCalledTimes(1)
      expect(appWindow.webContents.send).toHaveBeenCalledWith('windowsLinuxTitleBar', true)
    })
  })

  describe('maximizeWindow', () => {
    describe('when the window is maximized', () => {
      test('calls appWindow.unmaximize', () => {
        const { appWindow } = setup({
          isMaximized: jest.fn().mockReturnValue(true)
        })

        ipcRenderer.send('maximizeWindow')

        expect(appWindow.unmaximize).toHaveBeenCalledTimes(1)
        expect(appWindow.unmaximize).toHaveBeenCalledWith()
      })
    })

    describe('when the window is not maximized', () => {
      test('calls appWindow.maximize', () => {
        const { appWindow } = setup({
          isMaximized: jest.fn().mockReturnValue(false)
        })

        ipcRenderer.send('maximizeWindow')

        expect(appWindow.maximize).toHaveBeenCalledTimes(1)
        expect(appWindow.maximize).toHaveBeenCalledWith()
      })
    })
  })

  describe('minimizeWindow', () => {
    test('calls appWindow.minimize', () => {
      const { appWindow } = setup()

      ipcRenderer.send('minimizeWindow')

      expect(appWindow.minimize).toHaveBeenCalledTimes(1)
      expect(appWindow.minimize).toHaveBeenCalledWith()
    })
  })

  describe('closeWindow', () => {
    test('calls appWindow.close', () => {
      const { appWindow } = setup()

      ipcRenderer.send('closeWindow')

      expect(appWindow.close).toHaveBeenCalledTimes(1)
      expect(appWindow.close).toHaveBeenCalledWith()
    })
  })

  describe('chooseDownloadLocation', () => {
    test('calls chooseDownloadLocation', () => {
      const { appWindow, database } = setup()

      ipcRenderer.send('chooseDownloadLocation')

      expect(chooseDownloadLocation).toHaveBeenCalledTimes(1)
      expect(chooseDownloadLocation).toHaveBeenCalledWith({
        appWindow,
        database
      })
    })
  })

  describe('openDownloadFolder', () => {
    test('calls openDownloadFolder', () => {
      const { database } = setup()

      const event = {}
      const info = { mock: 'info' }

      ipcRenderer.send('openDownloadFolder', event, info)

      expect(openDownloadFolder).toHaveBeenCalledTimes(1)
      expect(openDownloadFolder).toHaveBeenCalledWith({
        database,
        info
      })
    })
  })

  describe('copyDownloadPath', () => {
    test('calls copyDownloadPath', () => {
      const { database } = setup()

      const event = {}
      const info = { mock: 'info' }

      ipcRenderer.send('copyDownloadPath', event, info)

      expect(copyDownloadPath).toHaveBeenCalledTimes(1)
      expect(copyDownloadPath).toHaveBeenCalledWith({
        database,
        info
      })
    })
  })

  describe('sendToEula', () => {
    test('calls sendToEula', () => {
      const {
        appWindow,
        database,
        downloadsWaitingForEula
      } = setup()

      const event = {}
      const info = { mock: 'info' }

      ipcRenderer.send('sendToEula', event, info)

      expect(sendToEula).toHaveBeenCalledTimes(1)
      expect(sendToEula).toHaveBeenCalledWith({
        database,
        downloadsWaitingForEula,
        info,
        webContents: appWindow.webContents
      })
    })
  })

  describe('sendToLogin', () => {
    test('calls sendToLogin', () => {
      const {
        appWindow,
        database,
        downloadsWaitingForAuth
      } = setup()

      const event = {}
      const info = { mock: 'info' }

      ipcRenderer.send('sendToLogin', event, info)

      expect(sendToLogin).toHaveBeenCalledTimes(1)
      expect(sendToLogin).toHaveBeenCalledWith({
        database,
        downloadsWaitingForAuth,
        info,
        webContents: appWindow.webContents
      })
    })
  })

  describe('setPreferenceFieldValue', () => {
    test('calls setPreferenceFieldValue', () => {
      const { database } = setup()

      const event = {}
      const info = { mock: 'info' }

      ipcRenderer.send('setPreferenceFieldValue', event, info)

      expect(setPreferenceFieldValue).toHaveBeenCalledTimes(1)
      expect(setPreferenceFieldValue).toHaveBeenCalledWith({
        database,
        info
      })
    })
  })

  describe('getPreferenceFieldValue', () => {
    test('calls getPreferenceFieldValue', async () => {
      const { database } = setup()

      const event = {}
      const info = { mock: 'info' }

      const result = await ipcRenderer.invoke('getPreferenceFieldValue', event, info)

      expect(result).toEqual('mock getPreferenceFieldValue')

      expect(getPreferenceFieldValue).toHaveBeenCalledTimes(1)
      expect(getPreferenceFieldValue).toHaveBeenCalledWith({
        database,
        info
      })
    })
  })

  describe('will-download', () => {
    test('calls willDownload', () => {
      const {
        appWindow,
        currentDownloadItems,
        database,
        downloadIdContext,
        downloadsWaitingForAuth,
        downloadsWaitingForEula
      } = setup()

      const event = {}
      const item = { mock: 'item' }
      const webContents = {}

      appWindow.webContents.session.send('will-download', event, item, webContents)

      expect(willDownload).toHaveBeenCalledTimes(1)
      expect(willDownload).toHaveBeenCalledWith({
        currentDownloadItems,
        database,
        downloadIdContext,
        downloadsWaitingForAuth,
        downloadsWaitingForEula,
        event,
        item,
        webContents
      })
    })
  })

  describe('beginDownload', () => {
    test('calls beginDownload', () => {
      const {
        appWindow,
        currentDownloadItems,
        database,
        downloadIdContext
      } = setup()

      const event = {}
      const info = { mock: 'info' }

      ipcRenderer.send('beginDownload', event, info)

      expect(beginDownload).toHaveBeenCalledTimes(1)
      expect(beginDownload).toHaveBeenCalledWith({
        currentDownloadItems,
        database,
        downloadIdContext,
        info,
        webContents: appWindow.webContents
      })
    })
  })

  describe('cancelDownloadItem', () => {
    test('calls cancelDownloadItem', () => {
      const {
        currentDownloadItems,
        database
      } = setup()

      const event = {}
      const info = { mock: 'info' }

      ipcRenderer.send('cancelDownloadItem', event, info)

      expect(cancelDownloadItem).toHaveBeenCalledTimes(1)
      expect(cancelDownloadItem).toHaveBeenCalledWith({
        currentDownloadItems,
        database,
        info
      })
    })
  })

  describe('cancelErroredDownloadItem', () => {
    test('calls cancelErroredDownloadItem', () => {
      const {
        currentDownloadItems,
        database
      } = setup()

      const event = {}
      const info = { mock: 'info' }

      ipcRenderer.send('cancelErroredDownloadItem', event, info)

      expect(cancelErroredDownloadItem).toHaveBeenCalledTimes(1)
      expect(cancelErroredDownloadItem).toHaveBeenCalledWith({
        currentDownloadItems,
        database,
        info
      })
    })
  })

  describe('clearDownload', () => {
    test('calls clearDownload', () => {
      const {
        database
      } = setup()

      const event = {}
      const info = { mock: 'info' }

      ipcRenderer.send('clearDownload', event, info)

      expect(clearDownload).toHaveBeenCalledTimes(1)
      expect(clearDownload).toHaveBeenCalledWith({
        database,
        info
      })
    })
  })

  describe('deleteDownloadHistory', () => {
    test('calls deleteDownloadHistory', () => {
      const {
        database
      } = setup()

      const event = {}
      const info = { mock: 'info' }

      ipcRenderer.send('deleteDownloadHistory', event, info)

      expect(deleteDownloadHistory).toHaveBeenCalledTimes(1)
      expect(deleteDownloadHistory).toHaveBeenCalledWith({
        database,
        info
      })
    })
  })

  describe('pauseDownloadItem', () => {
    test('calls pauseDownloadItem', () => {
      const {
        currentDownloadItems,
        database
      } = setup()

      const event = {}
      const info = { mock: 'info' }

      ipcRenderer.send('pauseDownloadItem', event, info)

      expect(pauseDownloadItem).toHaveBeenCalledTimes(1)
      expect(pauseDownloadItem).toHaveBeenCalledWith({
        currentDownloadItems,
        database,
        info
      })
    })
  })

  describe('restartDownload', () => {
    test('calls restartDownload', () => {
      const {
        appWindow,
        currentDownloadItems,
        database,
        downloadIdContext
      } = setup()

      const event = {}
      const info = { mock: 'info' }

      ipcRenderer.send('restartDownload', event, info)

      expect(restartDownload).toHaveBeenCalledTimes(1)
      expect(restartDownload).toHaveBeenCalledWith({
        currentDownloadItems,
        database,
        downloadIdContext,
        info,
        webContents: appWindow.webContents
      })
    })
  })

  describe('resumeDownloadItem', () => {
    test('calls resumeDownloadItem', () => {
      const {
        appWindow,
        currentDownloadItems,
        database,
        downloadIdContext
      } = setup()

      const event = {}
      const info = { mock: 'info' }

      ipcRenderer.send('resumeDownloadItem', event, info)

      expect(resumeDownloadItem).toHaveBeenCalledTimes(1)
      expect(resumeDownloadItem).toHaveBeenCalledWith({
        currentDownloadItems,
        database,
        downloadIdContext,
        info,
        webContents: appWindow.webContents
      })
    })
  })

  describe('deleteDownload', () => {
    test('calls deleteDownload', () => {
      const { database } = setup()

      const event = {}
      const info = { mock: 'info' }

      ipcRenderer.send('deleteDownload', event, info)

      expect(deleteDownload).toHaveBeenCalledTimes(1)
      expect(deleteDownload).toHaveBeenCalledWith({
        database,
        info
      })
    })
  })

  describe('retryErroredDownloadItem', () => {
    test('calls retryErroredDownloadItem', () => {
      const {
        appWindow,
        currentDownloadItems,
        database,
        downloadIdContext
      } = setup()

      const event = {}
      const info = { mock: 'info' }

      ipcRenderer.send('retryErroredDownloadItem', event, info)

      expect(retryErroredDownloadItem).toHaveBeenCalledTimes(1)
      expect(retryErroredDownloadItem).toHaveBeenCalledWith({
        currentDownloadItems,
        database,
        downloadIdContext,
        info,
        webContents: appWindow.webContents
      })
    })
  })

  describe('setCancellingDownload', () => {
    test('calls setCancellingDownload', () => {
      const {
        currentDownloadItems,
        database
      } = setup()

      const event = {}
      const info = { mock: 'info' }

      ipcRenderer.send('setCancellingDownload', event, info)

      expect(setCancellingDownload).toHaveBeenCalledTimes(1)
      expect(setCancellingDownload).toHaveBeenCalledWith({
        currentDownloadItems,
        database,
        info
      })
    })
  })

  describe('setPendingDeleteDownloadHistory', () => {
    test('calls setPendingDeleteDownloadHistory', () => {
      const {
        database
      } = setup()

      const event = {}
      const info = { mock: 'info' }

      ipcRenderer.send('setPendingDeleteDownloadHistory', event, info)

      expect(setPendingDeleteDownloadHistory).toHaveBeenCalledTimes(1)
      expect(setPendingDeleteDownloadHistory).toHaveBeenCalledWith({
        database,
        info
      })
    })
  })

  describe('setRestartingDownload', () => {
    test('calls setRestartingDownload', () => {
      const {
        database
      } = setup()

      const event = {}
      const info = { mock: 'info' }

      ipcRenderer.send('setRestartingDownload', event, info)

      expect(setRestartingDownload).toHaveBeenCalledTimes(1)
      expect(setRestartingDownload).toHaveBeenCalledWith({
        database,
        info
      })
    })
  })

  describe('undoCancellingDownload', () => {
    test('calls undoCancellingDownload', () => {
      const {
        currentDownloadItems,
        database
      } = setup()

      const event = {}
      const info = { mock: 'info' }

      ipcRenderer.send('undoCancellingDownload', event, info)

      expect(undoCancellingDownload).toHaveBeenCalledTimes(1)
      expect(undoCancellingDownload).toHaveBeenCalledWith({
        currentDownloadItems,
        database,
        info
      })
    })
  })

  describe('undoClearDownload', () => {
    test('calls undoClearDownload', () => {
      const {
        database
      } = setup()

      const event = {}
      const info = { mock: 'info' }

      ipcRenderer.send('undoClearDownload', event, info)

      expect(undoClearDownload).toHaveBeenCalledTimes(1)
      expect(undoClearDownload).toHaveBeenCalledWith({
        database,
        info
      })
    })
  })

  describe('undoDeleteDownloadHistory', () => {
    test('calls undoDeleteDownloadHistory', () => {
      const {
        database
      } = setup()

      const event = {}
      const info = { mock: 'info' }

      ipcRenderer.send('undoDeleteDownloadHistory', event, info)

      expect(undoDeleteDownloadHistory).toHaveBeenCalledTimes(1)
      expect(undoDeleteDownloadHistory).toHaveBeenCalledWith({
        database,
        info
      })
    })
  })

  describe('undoRestartingDownload', () => {
    test('calls undoRestartingDownload', () => {
      const {
        database
      } = setup()

      const event = {}
      const info = { mock: 'info' }

      ipcRenderer.send('undoRestartingDownload', event, info)

      expect(undoRestartingDownload).toHaveBeenCalledTimes(1)
      expect(undoRestartingDownload).toHaveBeenCalledWith({
        database,
        info
      })
    })
  })

  describe('requestDownloadsProgress', () => {
    test('calls requestDownloadsProgress', () => {
      const { database } = setup()

      const event = {}
      const info = { mock: 'info' }

      ipcRenderer.send('requestDownloadsProgress', event, info)

      expect(requestDownloadsProgress).toHaveBeenCalledTimes(1)
      expect(requestDownloadsProgress).toHaveBeenCalledWith({
        database,
        info
      })
    })
  })

  describe('requestFilesProgress', () => {
    test('calls requestFilesProgress', () => {
      const { database } = setup()

      const event = {}
      const info = { mock: 'info' }

      ipcRenderer.send('requestFilesProgress', event, info)

      expect(requestFilesProgress).toHaveBeenCalledTimes(1)
      expect(requestFilesProgress).toHaveBeenCalledWith({
        database,
        info
      })
    })
  })

  describe('update-available', () => {
    test('calls setUpdateAvailable sends the `autoUpdateAvailable` message', () => {
      const {
        appWindow,
        autoUpdater,
        setUpdateAvailable
      } = setup()

      appWindow.webContents.send = jest.fn()

      autoUpdater.send('update-available')

      expect(setUpdateAvailable).toHaveBeenCalledTimes(1)
      expect(setUpdateAvailable).toHaveBeenCalledWith(true)

      expect(appWindow.webContents.send).toHaveBeenCalledTimes(1)
      expect(appWindow.webContents.send).toHaveBeenCalledWith('autoUpdateAvailable')
    })
  })

  describe('update-not-available', () => {
    test('calls setUpdateAvailable and startPendingDownloads', () => {
      const {
        appWindow,
        autoUpdater,
        database,
        setUpdateAvailable
      } = setup()

      autoUpdater.send('update-not-available')

      expect(setUpdateAvailable).toHaveBeenCalledTimes(1)
      expect(setUpdateAvailable).toHaveBeenCalledWith(false)

      expect(startPendingDownloads).toHaveBeenCalledTimes(1)
      expect(startPendingDownloads).toHaveBeenCalledWith({
        appWindow,
        database
      })
    })
  })

  describe('error', () => {
    test('calls setUpdateAvailable and startPendingDownloads', () => {
      const consoleMock = jest.spyOn(console, 'log').mockImplementation(() => {})
      const {
        appWindow,
        autoUpdater,
        database,
        setUpdateAvailable
      } = setup()

      autoUpdater.send('error', 'mock error')

      expect(consoleMock).toHaveBeenCalledTimes(1)
      expect(consoleMock).toHaveBeenCalledWith('Error in auto-updater. mock error')

      expect(setUpdateAvailable).toHaveBeenCalledTimes(1)
      expect(setUpdateAvailable).toHaveBeenCalledWith(false)

      expect(startPendingDownloads).toHaveBeenCalledTimes(1)
      expect(startPendingDownloads).toHaveBeenCalledWith({
        appWindow,
        database
      })
    })
  })

  describe('download-progress', () => {
    test('sends the `autoUpdateProgress` message', () => {
      const {
        appWindow,
        autoUpdater
      } = setup()

      appWindow.webContents.send = jest.fn()

      autoUpdater.send('download-progress', { percent: 42 })

      expect(appWindow.webContents.send).toHaveBeenCalledTimes(1)
      expect(appWindow.webContents.send).toHaveBeenCalledWith('autoUpdateProgress', { percent: 42 })
    })
  })

  describe('update-downloaded', () => {
    describe('when selecting install now', () => {
      test('calls autoUpdater.quitAndInstall', () => {
        dialog.showMessageBoxSync.mockReturnValue(0)
        const {
          appWindow,
          autoUpdater
        } = setup()

        appWindow.webContents.send = jest.fn()

        autoUpdater.send('update-downloaded')

        expect(appWindow.webContents.send).toHaveBeenCalledTimes(1)
        expect(appWindow.webContents.send).toHaveBeenCalledWith('autoUpdateProgress', { percent: 100 })

        expect(autoUpdater.quitAndInstall).toHaveBeenCalledTimes(1)
        expect(autoUpdater.quitAndInstall).toHaveBeenCalledWith()
      })
    })

    describe('when selecting install later', () => {
      test('calls setUpdateAvailable and startPendingDownloads', () => {
        dialog.showMessageBoxSync.mockReturnValue(1)
        const {
          appWindow,
          autoUpdater,
          database,
          setUpdateAvailable
        } = setup()

        appWindow.webContents.send = jest.fn()

        autoUpdater.send('update-downloaded')

        expect(appWindow.webContents.send).toHaveBeenCalledTimes(1)
        expect(appWindow.webContents.send).toHaveBeenCalledWith('autoUpdateProgress', { percent: 100 })

        expect(autoUpdater.quitAndInstall).toHaveBeenCalledTimes(0)

        expect(setUpdateAvailable).toHaveBeenCalledTimes(1)
        expect(setUpdateAvailable).toHaveBeenCalledWith(false)

        expect(startPendingDownloads).toHaveBeenCalledTimes(1)
        expect(startPendingDownloads).toHaveBeenCalledWith({
          appWindow,
          database
        })
      })
    })
  })

  describe('autoUpdateInstallLater', () => {
    test('calls setUpdateAvailable and startPendingDownloads', () => {
      dialog.showMessageBoxSync.mockReturnValue(0)
      const {
        appWindow,
        database,
        setUpdateAvailable
      } = setup()

      ipcRenderer.send('autoUpdateInstallLater')

      expect(setUpdateAvailable).toHaveBeenCalledTimes(1)
      expect(setUpdateAvailable).toHaveBeenCalledWith(false)

      expect(startPendingDownloads).toHaveBeenCalledTimes(1)
      expect(startPendingDownloads).toHaveBeenCalledWith({
        appWindow,
        database
      })
    })

    describe('when running update-downloaded after selecting install later', () => {
      test('does nothing ', () => {
        dialog.showMessageBoxSync.mockReturnValue(1)
        const {
          appWindow,
          autoUpdater,
          setUpdateAvailable
        } = setup()

        appWindow.webContents.send = jest.fn()

        ipcRenderer.send('autoUpdateInstallLater')

        jest.clearAllMocks()

        autoUpdater.send('update-downloaded')

        expect(appWindow.webContents.send).toHaveBeenCalledTimes(1)
        expect(appWindow.webContents.send).toHaveBeenCalledWith('autoUpdateProgress', { percent: 100 })

        expect(autoUpdater.quitAndInstall).toHaveBeenCalledTimes(0)
        expect(setUpdateAvailable).toHaveBeenCalledTimes(0)
        expect(startPendingDownloads).toHaveBeenCalledTimes(0)
      })
    })
  })

  describe('autoUpdater error event', () => {
    test('handles auto-update errors correctly', async () => {
      const consoleMock = jest.spyOn(console, 'log').mockImplementation(() => {})
      const error = new Error('Mock update error')

      const {
        appWindow,
        autoUpdater,
        database,
        setUpdateAvailable
      } = setup()

      autoUpdater.send('error', error)

      expect(consoleMock).toHaveBeenCalledWith(`Error in auto-updater. ${error}`)
      expect(setUpdateAvailable).toHaveBeenCalledWith(false)
      expect(startPendingDownloads).toHaveBeenCalledWith({
        appWindow,
        database
      })
    })
  })

  describe('did-finish-load', () => {
    test('calls didFinishLoad', async () => {
      const {
        appWindow,
        autoUpdater,
        database,
        setUpdateAvailable
      } = setup()

      await appWindow.webContents.send('did-finish-load')

      expect(didFinishLoad).toHaveBeenCalledTimes(1)
      expect(didFinishLoad).toHaveBeenCalledWith({
        appWindow,
        autoUpdater,
        database,
        setUpdateAvailable
      })
    })
  })

  describe('before-quit', () => {
    describe('when the app is not packaged', () => {
      test('does not call beforeQuit', async () => {
        app.isPackaged = false
        const { appWindow } = setup()

        await appWindow.send('close')

        expect(beforeQuit).toHaveBeenCalledTimes(0)
      })
    })

    describe('when the app is packaged', () => {
      test('does not call beforeQuit', async () => {
        app.isPackaged = true
        const { appWindow } = setup()

        await appWindow.send('close')

        expect(beforeQuit).toHaveBeenCalledTimes(1)
      })
    })
  })

  describe('closed', () => {
    test('calls app.quit', async () => {
      const {
        appWindow
      } = setup()

      await appWindow.webContents.send('closed')

      expect(app.quit).toHaveBeenCalledTimes(1)
    })
  })
})
