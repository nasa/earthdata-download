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
      removeListener: jest.fn()
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

  test('setPreferenceFieldValue sends the setPreferenceFieldValue message', async () => {
    await setup()

    electronApi.setPreferenceFieldValue({ mock: 'data' })

    expect(ipcRenderer.send).toHaveBeenCalledTimes(1)
    expect(ipcRenderer.send).toHaveBeenCalledWith('setPreferenceFieldValue', { mock: 'data' })
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
      expect(ipcRenderer.removeListener).toHaveBeenCalledTimes(0)
    })

    test('calls ipcRenderer.removeListener', async () => {
      await setup()

      const mockCallback = jest.fn()

      electronApi.autoUpdateAvailable(false, mockCallback)

      expect(ipcRenderer.on).toHaveBeenCalledTimes(0)
      expect(ipcRenderer.removeListener).toHaveBeenCalledTimes(1)
      expect(ipcRenderer.removeListener).toHaveBeenCalledWith('autoUpdateAvailable', mockCallback)
    })
  })

  describe('autoUpdateProgress listener', () => {
    test('calls ipcRenderer.on', async () => {
      await setup()

      const mockCallback = jest.fn()

      electronApi.autoUpdateProgress(true, mockCallback)

      expect(ipcRenderer.on).toHaveBeenCalledTimes(1)
      expect(ipcRenderer.on).toHaveBeenCalledWith('autoUpdateProgress', mockCallback)
      expect(ipcRenderer.removeListener).toHaveBeenCalledTimes(0)
    })

    test('calls ipcRenderer.removeListener', async () => {
      await setup()

      const mockCallback = jest.fn()

      electronApi.autoUpdateProgress(false, mockCallback)

      expect(ipcRenderer.on).toHaveBeenCalledTimes(0)
      expect(ipcRenderer.removeListener).toHaveBeenCalledTimes(1)
      expect(ipcRenderer.removeListener).toHaveBeenCalledWith('autoUpdateProgress', mockCallback)
    })
  })

  describe('initializeDownload listener', () => {
    test('calls ipcRenderer.on', async () => {
      await setup()

      const mockCallback = jest.fn()

      electronApi.initializeDownload(true, mockCallback)

      expect(ipcRenderer.on).toHaveBeenCalledTimes(1)
      expect(ipcRenderer.on).toHaveBeenCalledWith('initializeDownload', mockCallback)
      expect(ipcRenderer.removeListener).toHaveBeenCalledTimes(0)
    })

    test('calls ipcRenderer.removeListener', async () => {
      await setup()

      const mockCallback = jest.fn()

      electronApi.initializeDownload(false, mockCallback)

      expect(ipcRenderer.on).toHaveBeenCalledTimes(0)
      expect(ipcRenderer.removeListener).toHaveBeenCalledTimes(1)
      expect(ipcRenderer.removeListener).toHaveBeenCalledWith('initializeDownload', mockCallback)
    })
  })

  describe('setDownloadLocation listener', () => {
    test('calls ipcRenderer.on', async () => {
      await setup()

      const mockCallback = jest.fn()

      electronApi.setDownloadLocation(true, mockCallback)

      expect(ipcRenderer.on).toHaveBeenCalledTimes(1)
      expect(ipcRenderer.on).toHaveBeenCalledWith('setDownloadLocation', mockCallback)
      expect(ipcRenderer.removeListener).toHaveBeenCalledTimes(0)
    })

    test('calls ipcRenderer.removeListener', async () => {
      await setup()

      const mockCallback = jest.fn()

      electronApi.setDownloadLocation(false, mockCallback)

      expect(ipcRenderer.on).toHaveBeenCalledTimes(0)
      expect(ipcRenderer.removeListener).toHaveBeenCalledTimes(1)
      expect(ipcRenderer.removeListener).toHaveBeenCalledWith('setDownloadLocation', mockCallback)
    })
  })

  describe('showWaitingForEulaDialog listener', () => {
    test('calls ipcRenderer.on', async () => {
      await setup()

      const mockCallback = jest.fn()

      electronApi.showWaitingForEulaDialog(true, mockCallback)

      expect(ipcRenderer.on).toHaveBeenCalledTimes(1)
      expect(ipcRenderer.on).toHaveBeenCalledWith('showWaitingForEulaDialog', mockCallback)
      expect(ipcRenderer.removeListener).toHaveBeenCalledTimes(0)
    })

    test('calls ipcRenderer.removeListener', async () => {
      await setup()

      const mockCallback = jest.fn()

      electronApi.showWaitingForEulaDialog(false, mockCallback)

      expect(ipcRenderer.on).toHaveBeenCalledTimes(0)
      expect(ipcRenderer.removeListener).toHaveBeenCalledTimes(1)
      expect(ipcRenderer.removeListener).toHaveBeenCalledWith('showWaitingForEulaDialog', mockCallback)
    })
  })

  describe('showWaitingForLoginDialog listener', () => {
    test('calls ipcRenderer.on', async () => {
      await setup()

      const mockCallback = jest.fn()

      electronApi.showWaitingForLoginDialog(true, mockCallback)

      expect(ipcRenderer.on).toHaveBeenCalledTimes(1)
      expect(ipcRenderer.on).toHaveBeenCalledWith('showWaitingForLoginDialog', mockCallback)
      expect(ipcRenderer.removeListener).toHaveBeenCalledTimes(0)
    })

    test('calls ipcRenderer.removeListener', async () => {
      await setup()

      const mockCallback = jest.fn()

      electronApi.showWaitingForLoginDialog(false, mockCallback)

      expect(ipcRenderer.on).toHaveBeenCalledTimes(0)
      expect(ipcRenderer.removeListener).toHaveBeenCalledTimes(1)
      expect(ipcRenderer.removeListener).toHaveBeenCalledWith('showWaitingForLoginDialog', mockCallback)
    })
  })

  describe('windowsLinuxTitleBar listener', () => {
    test('calls ipcRenderer.on', async () => {
      await setup()

      const mockCallback = jest.fn()

      electronApi.windowsLinuxTitleBar(true, mockCallback)

      expect(ipcRenderer.on).toHaveBeenCalledTimes(1)
      expect(ipcRenderer.on).toHaveBeenCalledWith('windowsLinuxTitleBar', mockCallback)
      expect(ipcRenderer.removeListener).toHaveBeenCalledTimes(0)
    })

    test('calls ipcRenderer.removeListener', async () => {
      await setup()

      const mockCallback = jest.fn()

      electronApi.windowsLinuxTitleBar(false, mockCallback)

      expect(ipcRenderer.on).toHaveBeenCalledTimes(0)
      expect(ipcRenderer.removeListener).toHaveBeenCalledTimes(1)
      expect(ipcRenderer.removeListener).toHaveBeenCalledWith('windowsLinuxTitleBar', mockCallback)
    })
  })
})
