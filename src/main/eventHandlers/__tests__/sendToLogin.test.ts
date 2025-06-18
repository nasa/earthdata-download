// @ts-nocheck

import { shell } from 'electron'

import sendToLogin from '../sendToLogin'

import downloadStates from '../../../app/constants/downloadStates'
import metricsEvent from '../../../app/constants/metricsEvent'
import metricsLogger from '../../utils/metricsLogger'

jest.mock('electronShell', () => ({
  shell: {
    openExternal: jest.fn()
  }
}))

jest.mock('../../utils/metricsLogger.ts', () => ({
  __esModule: true,
  default: jest.fn(() => {})
}))

describe('sendToLogin', () => {
  test('opens the authUrl', async () => {
    const database = {
      getFileWhere: jest.fn(),
      getDownloadById: jest.fn().mockResolvedValue({
        authUrl: 'http://example.com/auth?eddRedirect=earthdata-download%3A%2F%2FauthCallback'
      }),
      updateFileById: jest.fn()
    }
    const downloadsWaitingForAuth = {}
    const info = {
      downloadId: 'downloadID',
      fileId: 1234
    }
    const webContents = {
      send: jest.fn()
    }

    await sendToLogin({
      database,
      downloadsWaitingForAuth,
      info,
      webContents
    })

    expect(metricsLogger).toHaveBeenCalledTimes(1)
    expect(metricsLogger).toHaveBeenCalledWith(database, {
      eventType: metricsEvent.sentToEdl,
      data: {
        downloadId: 'downloadID'
      }
    })

    expect(database.getFileWhere).toHaveBeenCalledTimes(0)

    expect(shell.openExternal).toHaveBeenCalledTimes(1)
    expect(shell.openExternal).toHaveBeenCalledWith('http://example.com/auth?eddRedirect=earthdata-download%3A%2F%2FauthCallback%3FfileId%3D1234')

    expect(webContents.send).toHaveBeenCalledTimes(1)
    expect(webContents.send).toHaveBeenCalledWith('showWaitingForLoginDialog', {
      downloadId: 'downloadID',
      showDialog: true
    })

    expect(database.updateFileById).toHaveBeenCalledTimes(1)
    expect(database.updateFileById).toHaveBeenCalledWith(1234, {
      state: downloadStates.waitingForAuth,
      timeStart: null
    })
  })

  describe('when a fileId is not provided', () => {
    test('opens the authUrl', async () => {
      const database = {
        getFileWhere: jest.fn().mockResolvedValue({
          id: 1234
        }),
        getDownloadById: jest.fn().mockResolvedValue({
          authUrl: 'http://example.com/auth?eddRedirect=earthdata-download%3A%2F%2FauthCallback'
        }),
        updateFileById: jest.fn()
      }
      const downloadsWaitingForAuth = {}
      const info = {
        downloadId: 'downloadID',
        forceLogin: false
      }
      const webContents = {
        send: jest.fn()
      }

      await sendToLogin({
        database,
        downloadsWaitingForAuth,
        info,
        webContents
      })

      expect(metricsLogger).toHaveBeenCalledTimes(1)
      expect(metricsLogger).toHaveBeenCalledWith(database, {
        eventType: metricsEvent.sentToEdl,
        data: {
          downloadId: 'downloadID'
        }
      })

      expect(database.getFileWhere).toHaveBeenCalledTimes(1)
      expect(database.getFileWhere).toHaveBeenCalledWith({
        downloadId: 'downloadID',
        state: downloadStates.waitingForAuth
      })

      expect(shell.openExternal).toHaveBeenCalledTimes(1)
      expect(shell.openExternal).toHaveBeenCalledWith('http://example.com/auth?eddRedirect=earthdata-download%3A%2F%2FauthCallback%3FfileId%3D1234')

      expect(webContents.send).toHaveBeenCalledTimes(1)
      expect(webContents.send).toHaveBeenCalledWith('showWaitingForLoginDialog', {
        downloadId: 'downloadID',
        showDialog: true
      })

      expect(database.updateFileById).toHaveBeenCalledTimes(1)
      expect(database.updateFileById).toHaveBeenCalledWith(1234, {
        state: downloadStates.waitingForAuth,
        timeStart: null
      })
    })
  })

  describe('when the download is already waiting for auth', () => {
    test('does not open the authUrl', async () => {
      const database = {
        getFileWhere: jest.fn(),
        getDownloadById: jest.fn().mockResolvedValue({
          authUrl: 'http://example.com/auth?eddRedirect=earthdata-download%3A%2F%2FauthCallback'
        }),
        updateFileById: jest.fn()
      }
      const downloadsWaitingForAuth = {
        downloadID: true
      }
      const info = {
        downloadId: 'downloadID',
        fileId: 1234,
        forceLogin: false
      }
      const webContents = {
        send: jest.fn()
      }

      await sendToLogin({
        database,
        downloadsWaitingForAuth,
        info,
        webContents
      })

      expect(metricsLogger).toHaveBeenCalledTimes(0)

      expect(database.getFileWhere).toHaveBeenCalledTimes(0)
      expect(shell.openExternal).toHaveBeenCalledTimes(0)
      expect(webContents.send).toHaveBeenCalledTimes(0)

      expect(database.updateFileById).toHaveBeenCalledTimes(1)
      expect(database.updateFileById).toHaveBeenCalledWith(1234, {
        state: downloadStates.pending,
        timeStart: null
      })
    })
  })

  describe('forceLogin is set to true', () => {
    test('does not open the authUrl', async () => {
      const database = {
        getFileWhere: jest.fn(),
        getDownloadById: jest.fn().mockResolvedValue({
          authUrl: 'http://example.com/auth?eddRedirect=earthdata-download%3A%2F%2FauthCallback'
        }),
        updateFileById: jest.fn()
      }
      const downloadsWaitingForAuth = {
        downloadID: true
      }
      const info = {
        downloadId: 'downloadID',
        fileId: 1234,
        forceLogin: true
      }
      const webContents = {
        send: jest.fn()
      }

      await sendToLogin({
        database,
        downloadsWaitingForAuth,
        info,
        webContents
      })

      expect(metricsLogger).toHaveBeenCalledTimes(1)
      expect(metricsLogger).toHaveBeenCalledWith(database, {
        eventType: metricsEvent.sentToEdl,
        data: {
          downloadId: 'downloadID'
        }
      })

      expect(database.getFileWhere).toHaveBeenCalledTimes(0)

      expect(shell.openExternal).toHaveBeenCalledTimes(1)
      expect(shell.openExternal).toHaveBeenCalledWith('http://example.com/auth?eddRedirect=earthdata-download%3A%2F%2FauthCallback%3FfileId%3D1234')

      expect(webContents.send).toHaveBeenCalledTimes(1)
      expect(webContents.send).toHaveBeenCalledWith('showWaitingForLoginDialog', {
        downloadId: 'downloadID',
        showDialog: true
      })

      expect(database.updateFileById).toHaveBeenCalledTimes(1)
      expect(database.updateFileById).toHaveBeenCalledWith(1234, {
        state: downloadStates.waitingForAuth,
        timeStart: null
      })
    })
  })
})
