// @ts-nocheck

import MockDate from 'mockdate'

import openUrl from '../openUrl'

import downloadStates from '../../../app/constants/downloadStates'

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

beforeEach(() => {
  MockDate.set('2023-05-01')
})

describe('openUrl', () => {
  describe('when hostname is startDownload', () => {
    test('calls startPendingDownloads when no update is available', async () => {
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
          createdAt: 1682899200000,
          getLinksToken: 'Bearer mock-token',
          getLinksUrl: 'http://localhost:3000/granule_links?id=42&flattenLinks=true&linkTypes=data',
          state: 'PENDING'
        }
      )

      expect(startPendingDownloads).toHaveBeenCalledTimes(1)
      expect(startPendingDownloads).toHaveBeenCalledWith({
        appWindow: {},
        database
      })
    })

    test('does not call startPendingDownloads when an update is available', async () => {
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
        updateAvailable: true
      })

      expect(database.createDownload).toHaveBeenCalledTimes(1)
      expect(database.createDownload).toHaveBeenCalledWith(
        'shortName_versionId-20230501_000000',
        {
          authUrl: null,
          createdAt: 1682899200000,
          getLinksToken: 'Bearer mock-token',
          getLinksUrl: 'http://localhost:3000/granule_links?id=42&flattenLinks=true&linkTypes=data',
          state: 'PENDING'
        }
      )

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
})
