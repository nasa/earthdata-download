// @ts-nocheck

import { shell } from 'electron'

import sendToEula from '../sendToEula'

import downloadStates from '../../../app/constants/downloadStates'
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

describe('sendToEula', () => {
  test('opens the eulaRedirectUrl', async () => {
    const database = {
      getFileWhere: jest.fn(),
      getDownloadById: jest.fn().mockResolvedValue({
        eulaUrl: 'http://example.com/accept_eula',
        eulaRedirectUrl: 'http://example.com/auth?eddRedirect=earthdata-download%3A%2F%2FeulaCallback'
      }),
      updateFileById: jest.fn()
    }
    const downloadsWaitingForEula = {}
    const info = {
      downloadId: 'downloadID',
      fileId: 1234
    }
    const webContents = {
      send: jest.fn()
    }

    await sendToEula({
      database,
      downloadsWaitingForEula,
      info,
      webContents
    })

    expect(metricsLogger).toHaveBeenCalledTimes(1)
    expect(metricsLogger).toHaveBeenCalledWith({
      eventType: 'SentToEula',
      data: {
        downloadId: 'downloadID'
      }
    })

    expect(database.getFileWhere).toHaveBeenCalledTimes(0)

    expect(shell.openExternal).toHaveBeenCalledTimes(1)
    expect(shell.openExternal).toHaveBeenCalledWith('http://example.com/accept_eula&redirect_uri=http%3A%2F%2Fexample.com%2Fauth%3FeddRedirect%3Dearthdata-download%253A%252F%252FeulaCallback%253FfileId%253D1234')

    expect(webContents.send).toHaveBeenCalledTimes(1)
    expect(webContents.send).toHaveBeenCalledWith('showWaitingForEulaDialog', {
      downloadId: 'downloadID',
      showDialog: true
    })

    expect(database.updateFileById).toHaveBeenCalledTimes(1)
    expect(database.updateFileById).toHaveBeenCalledWith(1234, {
      state: downloadStates.waitingForEula,
      timeStart: null
    })
  })

  describe('when a fileId is not provided', () => {
    test('opens the eulaRedirectUrl', async () => {
      const database = {
        getFileWhere: jest.fn().mockResolvedValue({
          id: 1234
        }),
        getDownloadById: jest.fn().mockResolvedValue({
          eulaUrl: 'http://example.com/accept_eula',
          eulaRedirectUrl: 'http://example.com/auth?eddRedirect=earthdata-download%3A%2F%2FeulaCallback'
        }),
        updateFileById: jest.fn()
      }
      const downloadsWaitingForEula = {}
      const info = {
        downloadId: 'downloadID',
        forceLogin: false
      }
      const webContents = {
        send: jest.fn()
      }

      await sendToEula({
        database,
        downloadsWaitingForEula,
        info,
        webContents
      })

      expect(database.getFileWhere).toHaveBeenCalledTimes(1)
      expect(database.getFileWhere).toHaveBeenCalledWith({
        downloadId: 'downloadID',
        state: downloadStates.waitingForEula
      })

      expect(shell.openExternal).toHaveBeenCalledTimes(1)
      expect(shell.openExternal).toHaveBeenCalledWith('http://example.com/accept_eula&redirect_uri=http%3A%2F%2Fexample.com%2Fauth%3FeddRedirect%3Dearthdata-download%253A%252F%252FeulaCallback%253FfileId%253D1234')

      expect(webContents.send).toHaveBeenCalledTimes(1)
      expect(webContents.send).toHaveBeenCalledWith('showWaitingForEulaDialog', {
        downloadId: 'downloadID',
        showDialog: true
      })

      expect(database.updateFileById).toHaveBeenCalledTimes(1)
      expect(database.updateFileById).toHaveBeenCalledWith(1234, {
        state: downloadStates.waitingForEula,
        timeStart: null
      })
    })
  })

  describe('when the download is already waiting for auth', () => {
    test('does not open the eulaRedirectUrl', async () => {
      const database = {
        getFileWhere: jest.fn(),
        getDownloadById: jest.fn().mockResolvedValue({
          eulaUrl: 'http://example.com/accept_eula',
          eulaRedirectUrl: 'http://example.com/auth?eddRedirect=earthdata-download%3A%2F%2FeulaCallback'
        }),
        updateFileById: jest.fn()
      }
      const downloadsWaitingForEula = {
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

      await sendToEula({
        database,
        downloadsWaitingForEula,
        info,
        webContents
      })

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
    test('does not open the eulaRedirectUrl', async () => {
      const database = {
        getFileWhere: jest.fn(),
        getDownloadById: jest.fn().mockResolvedValue({
          eulaUrl: 'http://example.com/accept_eula',
          eulaRedirectUrl: 'http://example.com/auth?eddRedirect=earthdata-download%3A%2F%2FeulaCallback'
        }),
        updateFileById: jest.fn()
      }
      const downloadsWaitingForEula = {
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

      await sendToEula({
        database,
        downloadsWaitingForEula,
        info,
        webContents
      })

      expect(database.getFileWhere).toHaveBeenCalledTimes(0)

      expect(shell.openExternal).toHaveBeenCalledTimes(1)
      expect(shell.openExternal).toHaveBeenCalledWith('http://example.com/accept_eula&redirect_uri=http%3A%2F%2Fexample.com%2Fauth%3FeddRedirect%3Dearthdata-download%253A%252F%252FeulaCallback%253FfileId%253D1234')

      expect(webContents.send).toHaveBeenCalledTimes(1)
      expect(webContents.send).toHaveBeenCalledWith('showWaitingForEulaDialog', {
        downloadId: 'downloadID',
        showDialog: true
      })

      expect(database.updateFileById).toHaveBeenCalledTimes(1)
      expect(database.updateFileById).toHaveBeenCalledWith(1234, {
        state: downloadStates.waitingForEula,
        timeStart: null
      })
    })
  })
})
