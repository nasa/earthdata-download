// @ts-nocheck

import MockDate from 'mockdate'

import openUrl, { checkHostname } from '../openUrl'

import downloadStates from '../../../app/constants/downloadStates'
import metricsEvent from '../../../app/constants/metricsEvent'

import metricsLogger from '../../utils/metricsLogger'
import startPendingDownloads from '../../utils/startPendingDownloads'
import startNextDownload from '../../utils/startNextDownload'

jest.mock('../../utils/startPendingDownloads', () => ({
  __esModule: true,
  default: jest.fn(() => {})
}))

jest.mock('../../utils/startNextDownload', () => ({
  __esModule: true,
  default: jest.fn(() => {})
}))

jest.mock('../../utils/metricsLogger.ts', () => ({
  __esModule: true,
  default: jest.fn(() => {})
}))

beforeEach(() => {
  MockDate.set('2023-05-01')
})

describe('openUrl', () => {
  describe('when hostname is startDownload', () => {
    test('calls startPendingDownloads when no update is available', async () => {
      const appWindow = {}
      const deepLink = 'earthdata-download://startDownload?getLinks=http%3A%2F%2Flocalhost%3A3000%2Fgranule_links%3Fid%3D42%26flattenLinks%3Dtrue%26linkTypes%3Ddata&downloadId=shortName_versionId&clientId=eed-edsc-dev-serverless-client&token=Bearer mock-token'
      const database = {
        createDownload: jest.fn()
      }

      await openUrl({
        appWindow,
        currentDownloadItems: {},
        database,
        deepLink,
        downloadIdContext: {},
        downloadsWaitingForAuth: {},
        updateAvailable: false
      })

      expect(database.createDownload).toHaveBeenCalledTimes(1)
      expect(database.createDownload).toHaveBeenCalledWith(
        'shortName_versionId-20230501_000000',
        {
          authUrl: null,
          clientId: 'eed-edsc-dev-serverless-client',
          createdAt: 1682899200000,
          eulaRedirectUrl: null,
          getLinksToken: 'Bearer mock-token',
          getLinksUrl: 'http://localhost:3000/granule_links?id=42&flattenLinks=true&linkTypes=data',
          state: downloadStates.pending
        }
      )

      expect(metricsLogger).toHaveBeenCalledTimes(1)
      expect(metricsLogger).toHaveBeenCalledWith(database, {
        eventType: metricsEvent.openUrl,
        data: {
          clientId: 'eed-edsc-dev-serverless-client',
          downloadId: 'shortName_versionId-20230501_000000'
        }
      })

      expect(startPendingDownloads).toHaveBeenCalledTimes(1)
      expect(startPendingDownloads).toHaveBeenCalledWith({
        appWindow: {},
        database
      })
    })

    test('clientId is null', async () => {
      const appWindow = {}
      const deepLink = 'earthdata-download://startDownload?getLinks=http%3A%2F%2Flocalhost%3A3000%2Fgranule_links%3Fid%3D42%26flattenLinks%3Dtrue%26linkTypes%3Ddata&downloadId=shortName_versionId&token=Bearer mock-token'
      const database = {
        createDownload: jest.fn()
      }

      await openUrl({
        appWindow,
        currentDownloadItems: {},
        database,
        deepLink,
        downloadIdContext: {},
        downloadsWaitingForAuth: {},
        updateAvailable: false
      })

      expect(database.createDownload).toHaveBeenCalledTimes(1)
      expect(database.createDownload).toHaveBeenCalledWith(
        'shortName_versionId-20230501_000000',
        {
          authUrl: null,
          clientId: null,
          createdAt: 1682899200000,
          eulaRedirectUrl: null,
          getLinksToken: 'Bearer mock-token',
          getLinksUrl: 'http://localhost:3000/granule_links?id=42&flattenLinks=true&linkTypes=data',
          state: downloadStates.pending
        }
      )

      expect(metricsLogger).toHaveBeenCalledTimes(1)
      expect(metricsLogger).toHaveBeenCalledWith(database, {
        eventType: metricsEvent.openUrl,
        data: {
          clientId: null,
          downloadId: 'shortName_versionId-20230501_000000'
        }
      })

      expect(startPendingDownloads).toHaveBeenCalledTimes(1)
      expect(startPendingDownloads).toHaveBeenCalledWith({
        appWindow: {},
        database
      })
    })

    test('does not call startPendingDownloads when an update is available', async () => {
      const appWindow = {}
      const deepLink = 'earthdata-download://startDownload?getLinks=http%3A%2F%2Flocalhost%3A3000%2Fgranule_links%3Fid%3D42%26flattenLinks%3Dtrue%26linkTypes%3Ddata&downloadId=shortName_versionId&clientId=eed-edsc-dev-serverless-client&token=Bearer mock-token'
      const database = {
        createDownload: jest.fn()
      }

      await openUrl({
        appWindow,
        currentDownloadItems: {},
        database,
        deepLink,
        downloadIdContext: {},
        downloadsWaitingForAuth: {},
        updateAvailable: true
      })

      expect(database.createDownload).toHaveBeenCalledTimes(1)
      expect(database.createDownload).toHaveBeenCalledWith(
        'shortName_versionId-20230501_000000',
        {
          authUrl: null,
          clientId: 'eed-edsc-dev-serverless-client',
          createdAt: 1682899200000,
          eulaRedirectUrl: null,
          getLinksToken: 'Bearer mock-token',
          getLinksUrl: 'http://localhost:3000/granule_links?id=42&flattenLinks=true&linkTypes=data',
          state: downloadStates.pending
        }
      )

      expect(metricsLogger).toHaveBeenCalledTimes(1)
      expect(metricsLogger).toHaveBeenCalledWith(database, {
        eventType: metricsEvent.openUrl,
        data: {
          clientId: 'eed-edsc-dev-serverless-client',
          downloadId: 'shortName_versionId-20230501_000000'
        }
      })

      expect(startPendingDownloads).toHaveBeenCalledTimes(0)
    })

    test('does not call startPendingDownloads for the wrong hostname', async () => {
      const appWindow = {}
      const deepLink = 'earthdata-download://wrongHostname?getLinks=http%3A%2F%2Flocalhost%3A3000%2Fgranule_links%3Fid%3D42%26flattenLinks%3Dtrue%26linkTypes%3Ddata&downloadId=shortName_versionId&token=Bearer mock-token'
      const database = {}

      await openUrl({
        appWindow,
        currentDownloadItems: {},
        database,
        deepLink,
        downloadIdContext: {},
        downloadsWaitingForAuth: {}
      })

      expect(metricsLogger).toHaveBeenCalledTimes(0)
      expect(startPendingDownloads).toHaveBeenCalledTimes(0)
    })
  })

  describe('when hostname is authCallback', () => {
    test('updates the token and download and calls startNextDownload', async () => {
      const appWindow = {
        webContents: {
          send: jest.fn()
        }
      }
      const deepLink = 'earthdata-download://authCallback?token=mock-token&fileId=1234'
      const database = {
        setToken: jest.fn(),
        getFileWhere: jest.fn().mockResolvedValue({ downloadId: 'downloadId1' }),
        updateDownloadById: jest.fn()
      }
      const downloadsWaitingForAuth = {}

      await openUrl({
        appWindow,
        currentDownloadItems: {},
        database,
        deepLink,
        downloadIdContext: {},
        downloadsWaitingForAuth
      })

      expect(metricsLogger).toHaveBeenCalledTimes(0)

      expect(database.setToken).toHaveBeenCalledTimes(1)
      expect(database.setToken).toHaveBeenCalledWith('mock-token')

      expect(database.getFileWhere).toHaveBeenCalledTimes(1)
      expect(database.getFileWhere).toHaveBeenCalledWith({ id: '1234' })

      expect(database.updateDownloadById).toHaveBeenCalledTimes(1)
      expect(database.updateDownloadById).toHaveBeenCalledWith('downloadId1', { state: downloadStates.active })

      expect(appWindow.webContents.send).toHaveBeenCalledTimes(1)
      expect(appWindow.webContents.send).toHaveBeenCalledWith('showWaitingForLoginDialog', { showDialog: false })

      expect(startNextDownload).toHaveBeenCalledTimes(1)
      expect(startNextDownload).toHaveBeenCalledWith(expect.objectContaining({
        fileId: '1234'
      }))
    })
  })

  describe('when hostname is eulaCallback', () => {
    test('updates the download and calls startNextDownload', async () => {
      const appWindow = {
        webContents: {
          send: jest.fn()
        }
      }
      const deepLink = 'earthdata-download://eulaCallback?fileId=1234'
      const database = {
        getFileWhere: jest.fn().mockResolvedValue({ downloadId: 'downloadId1' }),
        updateDownloadById: jest.fn()
      }
      const downloadsWaitingForEula = {}

      await openUrl({
        appWindow,
        currentDownloadItems: {},
        database,
        deepLink,
        downloadIdContext: {},
        downloadsWaitingForEula
      })

      expect(metricsLogger).toHaveBeenCalledTimes(0)

      expect(database.getFileWhere).toHaveBeenCalledTimes(1)
      expect(database.getFileWhere).toHaveBeenCalledWith({ id: '1234' })

      expect(database.updateDownloadById).toHaveBeenCalledTimes(1)
      expect(database.updateDownloadById).toHaveBeenCalledWith('downloadId1', { state: downloadStates.active })

      expect(appWindow.webContents.send).toHaveBeenCalledTimes(1)
      expect(appWindow.webContents.send).toHaveBeenCalledWith('showWaitingForEulaDialog', { showDialog: false })

      expect(startNextDownload).toHaveBeenCalledTimes(1)
      expect(startNextDownload).toHaveBeenCalledWith(expect.objectContaining({
        fileId: '1234'
      }))
    })
  })
})

describe('checkHostname', () => {
  test.each(['startDownload', 'startdownload'])('accepts case insensitive startDownload', async (hostname) => {
    expect(checkHostname(hostname, 'startDownload')).toBe(true)
  })

  test.each(['authCallback', 'authcallback'])('accepts case insensitive authCallback', async (hostname) => {
    expect(checkHostname(hostname, 'authCallback')).toBe(true)
  })

  test.each(['eulaCallback', 'eulacallback'])('accepts case insensitive eulaCallback', async (hostname) => {
    expect(checkHostname(hostname, 'eulaCallback')).toBe(true)
  })

  test.each(['foo', 'bar'])('returns false when hostnames do not compare', async (hostname) => {
    expect(checkHostname(hostname, 'baz')).toBe(false)
  })
})
