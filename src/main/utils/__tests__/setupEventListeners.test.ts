// @ts-nocheck

import {
  app,
  dialog,
  ipcRenderer
} from 'electron'

import setupEventListeners from '../setupEventListeners'
import beginDownload from '../../eventHandlers/beginDownload'
import cancelDownloadItem from '../../eventHandlers/cancelDownloadItem'
import cancelErroredDownloadItem from '../../eventHandlers/cancelErroredDownloadItem'
import chooseDownloadLocation from '../../eventHandlers/chooseDownloadLocation'
import copyDownloadPath from '../../eventHandlers/copyDownloadPath'
import getPreferenceFieldValue from '../../eventHandlers/getPreferenceFieldValue'
import openDownloadFolder from '../../eventHandlers/openDownloadFolder'
import pauseDownloadItem from '../../eventHandlers/pauseDownloadItem'
import restartDownload from '../../eventHandlers/restartDownload'
import resumeDownloadItem from '../../eventHandlers/resumeDownloadItem'
import deleteDownload from '../../eventHandlers/deleteDownload'
import retryErroredDownloadItem from '../../eventHandlers/retryErroredDownloadItem'
import sendToEula from '../../eventHandlers/sendToEula'
import sendToLogin from '../../eventHandlers/sendToLogin'
import setPreferenceFieldValue from '../../eventHandlers/setPreferenceFieldValue'
import willDownload from '../../eventHandlers/willDownload'
import startPendingDownloads from '../../utils/startPendingDownloads'
import requestFilesProgress from '../../eventHandlers/requestFilesProgress'
import requestDownloadsProgress from '../../eventHandlers/requestDownloadsProgress'

jest.mock('../../eventHandlers/beginDownload')
jest.mock('../../eventHandlers/cancelDownloadItem')
jest.mock('../../eventHandlers/cancelErroredDownloadItem')
jest.mock('../../eventHandlers/chooseDownloadLocation')
jest.mock('../../eventHandlers/copyDownloadPath')
jest.mock('../../eventHandlers/getPreferenceFieldValue', () => ({
  __esModule: true,
  default: jest.fn().mockResolvedValue('mock getPreferenceFieldValue')
}))

jest.mock('../../eventHandlers/openDownloadFolder')
jest.mock('../../eventHandlers/pauseDownloadItem')
jest.mock('../../eventHandlers/restartDownload')
jest.mock('../../eventHandlers/resumeDownloadItem')
jest.mock('../../eventHandlers/deleteDownload')
jest.mock('../../eventHandlers/retryErroredDownloadItem')
jest.mock('../../eventHandlers/sendToEula')
jest.mock('../../eventHandlers/sendToLogin')
jest.mock('../../eventHandlers/setPreferenceFieldValue')
jest.mock('../../eventHandlers/willDownload')
jest.mock('../../utils/startPendingDownloads')
jest.mock('../../eventHandlers/requestFilesProgress')
jest.mock('../../eventHandlers/requestDownloadsProgress')

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
        channels[channel](data)
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
  const database = {}
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
      const { appWindow } = setup()

      ipcRenderer.send('chooseDownloadLocation')

      expect(chooseDownloadLocation).toHaveBeenCalledTimes(1)
      expect(chooseDownloadLocation).toHaveBeenCalledWith({ appWindow })
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

  describe('did-finish-load', () => {
    describe('when the app is not packaged', () => {
      test('opens the app window', async () => {
        const {
          appWindow,
          autoUpdater,
          database,
          setUpdateAvailable
        } = setup()

        await appWindow.webContents.send('did-finish-load')

        expect(appWindow.show).toHaveBeenCalledTimes(1)
        expect(autoUpdater.checkForUpdates).toHaveBeenCalledTimes(1)

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
        const {
          appWindow,
          autoUpdater,
          setUpdateAvailable
        } = setup()

        await appWindow.webContents.send('did-finish-load')

        expect(appWindow.show).toHaveBeenCalledTimes(1)
        expect(autoUpdater.checkForUpdates).toHaveBeenCalledTimes(1)

        expect(appWindow.webContents.openDevTools).toHaveBeenCalledTimes(0)
        expect(setUpdateAvailable).toHaveBeenCalledTimes(0)
        expect(startPendingDownloads).toHaveBeenCalledTimes(0)
      })
    })
  })
})
