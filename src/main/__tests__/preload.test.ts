// @ts-nocheck

import { ipcRenderer } from 'electron'

let electronApi = {}

jest.mock(
  'electron',
  () => {
    const mockIpcRenderer = {
      send: jest.fn(),
      invoke: jest.fn(),
      on: jest.fn(),
      removeAllListeners: jest.fn()
    }
    const mockContextBridge = {
      exposeInMainWorld: (name, events) => {
        electronApi = events
      }
    }

    return {
      contextBridge: mockContextBridge,
      ipcRenderer: mockIpcRenderer
    }
  },
  { virtual: true }
)

const setup = async () => {
  await import('../preload')
}

describe('preload', () => {
  test('beginDownload sends the beginDownload message', async () => {
    await setup()

    electronApi.beginDownload({ mock: 'data' })

    expect(ipcRenderer.send).toHaveBeenCalledTimes(1)
    expect(ipcRenderer.send).toHaveBeenCalledWith('beginDownload', { mock: 'data' })
  })

  test('chooseDownloadLocation sends chooseDownloadLocation', async () => {
    await setup()

    electronApi.chooseDownloadLocation()

    expect(ipcRenderer.send).toHaveBeenCalledTimes(1)
    expect(ipcRenderer.send).toHaveBeenCalledWith('chooseDownloadLocation')
  })

  test('clearDefaultDownload sends clearDefaultDownload', async () => {
    await setup()

    electronApi.clearDefaultDownload()

    expect(ipcRenderer.send).toHaveBeenCalledTimes(1)
    expect(ipcRenderer.send).toHaveBeenCalledWith('clearDefaultDownload')
  })

  test('sendToEula sends the sendToEula message', async () => {
    await setup()

    electronApi.sendToEula({ mock: 'data' })

    expect(ipcRenderer.send).toHaveBeenCalledTimes(1)
    expect(ipcRenderer.send).toHaveBeenCalledWith('sendToEula', { mock: 'data' })
  })

  test('sendToLogin sends the sendToLogin message', async () => {
    await setup()

    electronApi.sendToLogin({ mock: 'data' })

    expect(ipcRenderer.send).toHaveBeenCalledTimes(1)
    expect(ipcRenderer.send).toHaveBeenCalledWith('sendToLogin', { mock: 'data' })
  })

  test('setCancellingDownload sends the setCancellingDownload message', async () => {
    await setup()

    electronApi.setCancellingDownload({ mock: 'data' })

    expect(ipcRenderer.send).toHaveBeenCalledTimes(1)
    expect(ipcRenderer.send).toHaveBeenCalledWith('setCancellingDownload', { mock: 'data' })
  })

  test('setPendingDeleteDownloadHistory sends the setPendingDeleteDownloadHistory message', async () => {
    await setup()

    electronApi.setPendingDeleteDownloadHistory({ mock: 'data' })

    expect(ipcRenderer.send).toHaveBeenCalledTimes(1)
    expect(ipcRenderer.send).toHaveBeenCalledWith('setPendingDeleteDownloadHistory', { mock: 'data' })
  })

  test('setPreferenceFieldValue sends the setPreferenceFieldValue message', async () => {
    await setup()

    electronApi.setPreferenceFieldValue({ mock: 'data' })

    expect(ipcRenderer.send).toHaveBeenCalledTimes(1)
    expect(ipcRenderer.send).toHaveBeenCalledWith('setPreferenceFieldValue', { mock: 'data' })
  })

  test('setRestartingDownload sends the setRestartingDownload message', async () => {
    await setup()

    electronApi.setRestartingDownload({ mock: 'data' })

    expect(ipcRenderer.send).toHaveBeenCalledTimes(1)
    expect(ipcRenderer.send).toHaveBeenCalledWith('setRestartingDownload', { mock: 'data' })
  })

  test('getPreferenceFieldValue sends the getPreferenceFieldValue message', async () => {
    await setup()

    electronApi.getPreferenceFieldValue({ mock: 'data' })

    expect(ipcRenderer.invoke).toHaveBeenCalledTimes(1)
    expect(ipcRenderer.invoke).toHaveBeenCalledWith('getPreferenceFieldValue', { mock: 'data' })
  })

  test('autoUpdateInstallLater sends autoUpdateInstallLater', async () => {
    await setup()

    electronApi.autoUpdateInstallLater()

    expect(ipcRenderer.send).toHaveBeenCalledTimes(1)
    expect(ipcRenderer.send).toHaveBeenCalledWith('autoUpdateInstallLater')
  })

  test('cancelDownloadItem sends the cancelDownloadItem message', async () => {
    await setup()

    electronApi.cancelDownloadItem({ mock: 'data' })

    expect(ipcRenderer.send).toHaveBeenCalledTimes(1)
    expect(ipcRenderer.send).toHaveBeenCalledWith('cancelDownloadItem', { mock: 'data' })
  })

  test('cancelErroredDownloadItem sends the cancelErroredDownloadItem message', async () => {
    await setup()

    electronApi.cancelErroredDownloadItem({ mock: 'data' })

    expect(ipcRenderer.send).toHaveBeenCalledTimes(1)
    expect(ipcRenderer.send).toHaveBeenCalledWith('cancelErroredDownloadItem', { mock: 'data' })
  })

  test('clearDownload sends the clearDownload message', async () => {
    await setup()

    electronApi.clearDownload({ mock: 'data' })

    expect(ipcRenderer.send).toHaveBeenCalledTimes(1)
    expect(ipcRenderer.send).toHaveBeenCalledWith('clearDownload', { mock: 'data' })
  })

  test('deleteDownloadHistory sends the deleteDownloadHistory message', async () => {
    await setup()

    electronApi.deleteDownloadHistory({ mock: 'data' })

    expect(ipcRenderer.send).toHaveBeenCalledTimes(1)
    expect(ipcRenderer.send).toHaveBeenCalledWith('deleteDownloadHistory', { mock: 'data' })
  })

  test('closeWindow sends the closeWindow message', async () => {
    await setup()

    electronApi.closeWindow()

    expect(ipcRenderer.send).toHaveBeenCalledTimes(1)
    expect(ipcRenderer.send).toHaveBeenCalledWith('closeWindow')
  })

  test('copyDownloadPath sends the copyDownloadPath message', async () => {
    await setup()

    electronApi.copyDownloadPath({ mock: 'data' })

    expect(ipcRenderer.send).toHaveBeenCalledTimes(1)
    expect(ipcRenderer.send).toHaveBeenCalledWith('copyDownloadPath', { mock: 'data' })
  })

  test('maximizeWindow sends the maximizeWindow message', async () => {
    await setup()

    electronApi.maximizeWindow()

    expect(ipcRenderer.send).toHaveBeenCalledTimes(1)
    expect(ipcRenderer.send).toHaveBeenCalledWith('maximizeWindow')
  })

  test('minimizeWindow sends the minimizeWindow message', async () => {
    await setup()

    electronApi.minimizeWindow()

    expect(ipcRenderer.send).toHaveBeenCalledTimes(1)
    expect(ipcRenderer.send).toHaveBeenCalledWith('minimizeWindow')
  })

  test('openDownloadFolder sends the openDownloadFolder message', async () => {
    await setup()

    electronApi.openDownloadFolder({ mock: 'data' })

    expect(ipcRenderer.send).toHaveBeenCalledTimes(1)
    expect(ipcRenderer.send).toHaveBeenCalledWith('openDownloadFolder', { mock: 'data' })
  })

  test('pauseDownloadItem sends the pauseDownloadItem message', async () => {
    await setup()

    electronApi.pauseDownloadItem({ mock: 'data' })

    expect(ipcRenderer.send).toHaveBeenCalledTimes(1)
    expect(ipcRenderer.send).toHaveBeenCalledWith('pauseDownloadItem', { mock: 'data' })
  })

  test('restartDownload sends the restartDownload message', async () => {
    await setup()

    electronApi.restartDownload({ mock: 'data' })

    expect(ipcRenderer.send).toHaveBeenCalledTimes(1)
    expect(ipcRenderer.send).toHaveBeenCalledWith('restartDownload', { mock: 'data' })
  })

  test('resumeDownloadItem sends the resumeDownloadItem message', async () => {
    await setup()

    electronApi.resumeDownloadItem({ mock: 'data' })

    expect(ipcRenderer.send).toHaveBeenCalledTimes(1)
    expect(ipcRenderer.send).toHaveBeenCalledWith('resumeDownloadItem', { mock: 'data' })
  })

  test('deleteDownload sends the deleteDownload message', async () => {
    await setup()

    electronApi.deleteDownload({ mock: 'data' })

    expect(ipcRenderer.send).toHaveBeenCalledTimes(1)
    expect(ipcRenderer.send).toHaveBeenCalledWith('deleteDownload', { mock: 'data' })
  })

  test('retryErroredDownloadItem sends the retryErroredDownloadItem message', async () => {
    await setup()

    electronApi.retryErroredDownloadItem({ mock: 'data' })

    expect(ipcRenderer.send).toHaveBeenCalledTimes(1)
    expect(ipcRenderer.send).toHaveBeenCalledWith('retryErroredDownloadItem', { mock: 'data' })
  })

  test('undoCancellingDownload sends the undoCancellingDownload message', async () => {
    await setup()

    electronApi.undoCancellingDownload({ mock: 'data' })

    expect(ipcRenderer.send).toHaveBeenCalledTimes(1)
    expect(ipcRenderer.send).toHaveBeenCalledWith('undoCancellingDownload', { mock: 'data' })
  })

  test('undoClearDownload sends the undoClearDownload message', async () => {
    await setup()

    electronApi.undoClearDownload({ mock: 'data' })

    expect(ipcRenderer.send).toHaveBeenCalledTimes(1)
    expect(ipcRenderer.send).toHaveBeenCalledWith('undoClearDownload', { mock: 'data' })
  })

  test('undoDeleteDownloadHistory sends the undoDeleteDownloadHistory message', async () => {
    await setup()

    electronApi.undoDeleteDownloadHistory({ mock: 'data' })

    expect(ipcRenderer.send).toHaveBeenCalledTimes(1)
    expect(ipcRenderer.send).toHaveBeenCalledWith('undoDeleteDownloadHistory', { mock: 'data' })
  })

  test('undoRestartingDownload sends the undoRestartingDownload message', async () => {
    await setup()

    electronApi.undoRestartingDownload({ mock: 'data' })

    expect(ipcRenderer.send).toHaveBeenCalledTimes(1)
    expect(ipcRenderer.send).toHaveBeenCalledWith('undoRestartingDownload', { mock: 'data' })
  })

  test('requestDownloadsProgress sends the requestDownloadsProgress message', async () => {
    await setup()

    electronApi.requestDownloadsProgress({ mock: 'data' })

    expect(ipcRenderer.invoke).toHaveBeenCalledTimes(1)
    expect(ipcRenderer.invoke).toHaveBeenCalledWith('requestDownloadsProgress', { mock: 'data' })
  })

  test('requestFilesProgress sends the requestFilesProgress message', async () => {
    await setup()

    electronApi.requestFilesProgress({ mock: 'data' })

    expect(ipcRenderer.invoke).toHaveBeenCalledTimes(1)
    expect(ipcRenderer.invoke).toHaveBeenCalledWith('requestFilesProgress', { mock: 'data' })
  })

  describe('autoUpdateAvailable listener', () => {
    test('calls ipcRenderer.on', async () => {
      await setup()

      const mockCallback = jest.fn()

      electronApi.autoUpdateAvailable(true, mockCallback)

      expect(ipcRenderer.on).toHaveBeenCalledTimes(1)
      expect(ipcRenderer.on).toHaveBeenCalledWith('autoUpdateAvailable', mockCallback)
      expect(ipcRenderer.removeAllListeners).toHaveBeenCalledTimes(0)
    })

    test('calls ipcRenderer.removeAllListeners', async () => {
      await setup()

      const mockCallback = jest.fn()

      electronApi.autoUpdateAvailable(false, mockCallback)

      expect(ipcRenderer.on).toHaveBeenCalledTimes(0)
      expect(ipcRenderer.removeAllListeners).toHaveBeenCalledTimes(1)
      expect(ipcRenderer.removeAllListeners).toHaveBeenCalledWith('autoUpdateAvailable', mockCallback)
    })
  })

  describe('autoUpdateProgress listener', () => {
    test('calls ipcRenderer.on', async () => {
      await setup()

      const mockCallback = jest.fn()

      electronApi.autoUpdateProgress(true, mockCallback)

      expect(ipcRenderer.on).toHaveBeenCalledTimes(1)
      expect(ipcRenderer.on).toHaveBeenCalledWith('autoUpdateProgress', mockCallback)
      expect(ipcRenderer.removeAllListeners).toHaveBeenCalledTimes(0)
    })

    test('calls ipcRenderer.removeAllListeners', async () => {
      await setup()

      const mockCallback = jest.fn()

      electronApi.autoUpdateProgress(false, mockCallback)

      expect(ipcRenderer.on).toHaveBeenCalledTimes(0)
      expect(ipcRenderer.removeAllListeners).toHaveBeenCalledTimes(1)
      expect(ipcRenderer.removeAllListeners).toHaveBeenCalledWith('autoUpdateProgress', mockCallback)
    })
  })

  describe('autoUpdateError listener', () => {
    test('calls ipcRenderer.on', async () => {
      await setup()

      const mockCallback = jest.fn()

      electronApi.autoUpdateError(true, mockCallback)

      expect(ipcRenderer.on).toHaveBeenCalledTimes(1)
      expect(ipcRenderer.on).toHaveBeenCalledWith('autoUpdateError', mockCallback)
      expect(ipcRenderer.removeAllListeners).toHaveBeenCalledTimes(0)
    })

    test('calls ipcRenderer.removeAllListeners', async () => {
      await setup()

      const mockCallback = jest.fn()

      electronApi.autoUpdateError(false, mockCallback)

      expect(ipcRenderer.on).toHaveBeenCalledTimes(0)
      expect(ipcRenderer.removeAllListeners).toHaveBeenCalledTimes(1)
      expect(ipcRenderer.removeAllListeners).toHaveBeenCalledWith('autoUpdateError', mockCallback)
    })
  })

  describe('initializeDownload listener', () => {
    test('calls ipcRenderer.on', async () => {
      await setup()

      const mockCallback = jest.fn()

      electronApi.initializeDownload(true, mockCallback)

      expect(ipcRenderer.on).toHaveBeenCalledTimes(1)
      expect(ipcRenderer.on).toHaveBeenCalledWith('initializeDownload', mockCallback)
      expect(ipcRenderer.removeAllListeners).toHaveBeenCalledTimes(0)
    })

    test('calls ipcRenderer.removeAllListeners', async () => {
      await setup()

      const mockCallback = jest.fn()

      electronApi.initializeDownload(false, mockCallback)

      expect(ipcRenderer.on).toHaveBeenCalledTimes(0)
      expect(ipcRenderer.removeAllListeners).toHaveBeenCalledTimes(1)
      expect(ipcRenderer.removeAllListeners).toHaveBeenCalledWith('initializeDownload', mockCallback)
    })
  })

  describe('setDownloadLocation listener', () => {
    test('calls ipcRenderer.on', async () => {
      await setup()

      const mockCallback = jest.fn()

      electronApi.setDownloadLocation(true, mockCallback)

      expect(ipcRenderer.on).toHaveBeenCalledTimes(1)
      expect(ipcRenderer.on).toHaveBeenCalledWith('setDownloadLocation', mockCallback)
      expect(ipcRenderer.removeAllListeners).toHaveBeenCalledTimes(0)
    })

    test('calls ipcRenderer.removeAllListeners', async () => {
      await setup()

      const mockCallback = jest.fn()

      electronApi.setDownloadLocation(false, mockCallback)

      expect(ipcRenderer.on).toHaveBeenCalledTimes(0)
      expect(ipcRenderer.removeAllListeners).toHaveBeenCalledTimes(1)
      expect(ipcRenderer.removeAllListeners).toHaveBeenCalledWith('setDownloadLocation', mockCallback)
    })
  })

  describe('showWaitingForEulaDialog listener', () => {
    test('calls ipcRenderer.on', async () => {
      await setup()

      const mockCallback = jest.fn()

      electronApi.showWaitingForEulaDialog(true, mockCallback)

      expect(ipcRenderer.on).toHaveBeenCalledTimes(1)
      expect(ipcRenderer.on).toHaveBeenCalledWith('showWaitingForEulaDialog', mockCallback)
      expect(ipcRenderer.removeAllListeners).toHaveBeenCalledTimes(0)
    })

    test('calls ipcRenderer.removeAllListeners', async () => {
      await setup()

      const mockCallback = jest.fn()

      electronApi.showWaitingForEulaDialog(false, mockCallback)

      expect(ipcRenderer.on).toHaveBeenCalledTimes(0)
      expect(ipcRenderer.removeAllListeners).toHaveBeenCalledTimes(1)
      expect(ipcRenderer.removeAllListeners).toHaveBeenCalledWith('showWaitingForEulaDialog', mockCallback)
    })
  })

  describe('showWaitingForLoginDialog listener', () => {
    test('calls ipcRenderer.on', async () => {
      await setup()

      const mockCallback = jest.fn()

      electronApi.showWaitingForLoginDialog(true, mockCallback)

      expect(ipcRenderer.on).toHaveBeenCalledTimes(1)
      expect(ipcRenderer.on).toHaveBeenCalledWith('showWaitingForLoginDialog', mockCallback)
      expect(ipcRenderer.removeAllListeners).toHaveBeenCalledTimes(0)
    })

    test('calls ipcRenderer.removeAllListeners', async () => {
      await setup()

      const mockCallback = jest.fn()

      electronApi.showWaitingForLoginDialog(false, mockCallback)

      expect(ipcRenderer.on).toHaveBeenCalledTimes(0)
      expect(ipcRenderer.removeAllListeners).toHaveBeenCalledTimes(1)
      expect(ipcRenderer.removeAllListeners).toHaveBeenCalledWith('showWaitingForLoginDialog', mockCallback)
    })
  })

  describe('windowsLinuxTitleBar listener', () => {
    test('calls ipcRenderer.on', async () => {
      await setup()

      const mockCallback = jest.fn()

      electronApi.windowsLinuxTitleBar(true, mockCallback)

      expect(ipcRenderer.on).toHaveBeenCalledTimes(1)
      expect(ipcRenderer.on).toHaveBeenCalledWith('windowsLinuxTitleBar', mockCallback)
      expect(ipcRenderer.removeAllListeners).toHaveBeenCalledTimes(0)
    })

    test('calls ipcRenderer.removeAllListeners', async () => {
      await setup()

      const mockCallback = jest.fn()

      electronApi.windowsLinuxTitleBar(false, mockCallback)

      expect(ipcRenderer.on).toHaveBeenCalledTimes(0)
      expect(ipcRenderer.removeAllListeners).toHaveBeenCalledTimes(1)
      expect(ipcRenderer.removeAllListeners).toHaveBeenCalledWith('windowsLinuxTitleBar', mockCallback)
    })
  })
})
