// @ts-nocheck

import openUrl from '../openUrl'

import downloadStates from '../../../app/constants/downloadStates'

import fetchLinks from '../../utils/fetchLinks'
import startNextDownload from '../../utils/startNextDownload'

jest.mock('../../utils/fetchLinks', () => ({
  __esModule: true,
  default: jest.fn(() => {})
}))
jest.mock('../../utils/startNextDownload', () => ({
  __esModule: true,
  default: jest.fn(() => {})
}))

describe('openUrl', () => {
  describe('when hostname is startDownload', () => {
    test('calls fetchLinks', async () => {
      const appWindow = {}
      const deepLink = 'earthdata-download://startDownload?getLinks=http%3A%2F%2Flocalhost%3A3000%2Fgranule_links%3Fid%3D42%26flattenLinks%3Dtrue%26linkTypes%3Ddata&downloadId=shortName_versionId&token=Bearer mock-token'
      const database = {}

      await openUrl({
        appWindow,
        currentDownloadItems: {},
        database,
        deepLink,
        downloadIdContext: {},
        downloadsWaitingForAuth: {}
      })

      expect(fetchLinks).toHaveBeenCalledTimes(1)
      expect(fetchLinks).toHaveBeenCalledWith({
        appWindow: {},
        database: {},
        downloadId: 'shortName_versionId',
        getLinks: 'http://localhost:3000/granule_links?id=42&flattenLinks=true&linkTypes=data',
        authUrl: null,
        token: 'Bearer mock-token'
      })
    })

    test('does not call fetchLinks for the wrong hostname', async () => {
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

      expect(fetchLinks).toHaveBeenCalledTimes(0)
    })
  })

  describe('when hostname is authCallback', () => {
    test('updates the token and download and calls startNextDownload', async () => {
      const appWindow = {}
      const deepLink = 'earthdata-download://authCallback?token=mock-token&fileId=1234'
      const database = {
        setToken: jest.fn(),
        getFileWhere: jest.fn().mockResolvedValue({ downloadId: 'downloadId1' }),
        updateDownloadById: jest.fn()
      }
      const downloadsWaitingForAuth = {}
      const webContents = {
        send: jest.fn()
      }

      await openUrl({
        appWindow,
        currentDownloadItems: {},
        database,
        deepLink,
        downloadIdContext: {},
        downloadsWaitingForAuth,
        webContents
      })

      expect(database.setToken).toHaveBeenCalledTimes(1)
      expect(database.setToken).toHaveBeenCalledWith('mock-token')

      expect(database.getFileWhere).toHaveBeenCalledTimes(1)
      expect(database.getFileWhere).toHaveBeenCalledWith({ id: '1234' })

      expect(database.updateDownloadById).toHaveBeenCalledTimes(1)
      expect(database.updateDownloadById).toHaveBeenCalledWith('downloadId1', { state: downloadStates.active })

      expect(webContents.send).toHaveBeenCalledTimes(1)
      expect(webContents.send).toHaveBeenCalledWith('showWaitingForLoginDialog', { showDialog: false })

      expect(startNextDownload).toHaveBeenCalledTimes(1)
      expect(startNextDownload).toHaveBeenCalledWith(expect.objectContaining({
        fileId: '1234'
      }))
    })
  })
})
