// @ts-nocheck

import MockDate from 'mockdate'

import verifyDownload from '../verifyDownload'

import downloadStates from '../../../app/constants/downloadStates'
import sendToEula from '../../eventHandlers/sendToEula'
import metricsEvent from '../../../app/constants/metricsEvent'
import metricsLogger from '../metricsLogger'
import downloadIdForMetrics from '../downloadIdForMetrics'

jest.mock('../../eventHandlers/sendToEula', () => ({
  __esModule: true,
  default: jest.fn()
}))

jest.mock('../metricsLogger', () => ({
  __esModule: true,
  default: jest.fn()
}))

beforeEach(() => {
  MockDate.set('2023-05-13T22:00:00')
})

describe('verifyDownload', () => {
  describe('when the status is 200', () => {
    test('returns true', async () => {
      const downloadId = 'mock-download-id'
      const downloadsWaitingForEula = {}
      const database = {
        getToken: jest.fn().mockResolvedValue({ token: 'mock-token' }),
        updateDownloadById: jest.fn(),
        updateFileById: jest.fn()
      }
      const webContents = {
        downloadURL: jest.fn()
      }
      const fileId = 123
      const url = 'http://example.com/file.png'

      const response = {
        ok: true,
        status: 200,
        json: jest.fn().mockReturnValue({
          cursor: 'mock-cursor',
          links: [
            'https://example.com/file1.png'
          ]
        })
      }

      fetch.mockImplementationOnce(() => response)

      const result = await verifyDownload({
        database,
        downloadId,
        downloadsWaitingForEula,
        fileId,
        url,
        webContents
      })

      expect(result).toEqual(true)

      expect(fetch).toHaveBeenCalledTimes(1)
      expect(fetch).toHaveBeenCalledWith(
        'http://example.com/file.png',
        expect.objectContaining({
          follow: 20,
          headers: {
            Authorization: 'Bearer mock-token'
          },
          method: 'GET',
          size: 250
        })
      )

      expect(database.updateDownloadById).toHaveBeenCalledTimes(0)
      expect(database.updateFileById).toHaveBeenCalledTimes(0)

      expect(sendToEula).toHaveBeenCalledTimes(0)
    })
  })

  describe('when the status is 403 and needs a EULA', () => {
    test('returns false and calls sendToEula', async () => {
      const downloadId = 'mock-download-id'
      const downloadsWaitingForEula = {}
      const database = {
        getToken: jest.fn().mockResolvedValue({ token: null }),
        updateDownloadById: jest.fn(),
        updateFileById: jest.fn()
      }
      const webContents = {
        downloadURL: jest.fn()
      }
      const fileId = 123
      const url = 'http://example.com/file.png'

      const response = {
        ok: false,
        status: 403,
        json: jest.fn().mockReturnValue({
          status_code: 403,
          error_description: 'EULA Acceptance Failure',
          resolution_url: 'https://urs.earthdata.nasa.gov/approve_app?client_id=mock-client-id'
        })
      }

      fetch.mockImplementationOnce(() => response)

      const result = await verifyDownload({
        database,
        downloadId,
        downloadsWaitingForEula,
        fileId,
        url,
        webContents
      })

      expect(result).toEqual(false)

      expect(fetch).toHaveBeenCalledTimes(1)
      expect(fetch).toHaveBeenCalledWith(
        'http://example.com/file.png',
        expect.objectContaining({
          follow: 20,
          headers: {},
          method: 'GET',
          size: 250
        })
      )

      expect(database.updateDownloadById).toHaveBeenCalledTimes(1)
      expect(database.updateDownloadById).toHaveBeenCalledWith('mock-download-id', {
        eulaUrl: 'https://urs.earthdata.nasa.gov/approve_app?client_id=mock-client-id',
        state: downloadStates.waitingForEula
      })

      expect(database.updateFileById).toHaveBeenCalledTimes(0)

      expect(sendToEula).toHaveBeenCalledTimes(1)
      expect(sendToEula).toHaveBeenCalledWith(expect.objectContaining({
        downloadsWaitingForEula: {},
        info: {
          downloadId: 'mock-download-id',
          fileId: 123
        }
      }))
    })

    test('does not try to fetch the file if the downloadId is waitingForEula', async () => {
      const downloadId = 'mock-download-id'
      const downloadsWaitingForEula = {
        [downloadId]: {}
      }
      const database = {
        getToken: jest.fn().mockResolvedValue({ token: null }),
        updateDownloadById: jest.fn(),
        updateFileById: jest.fn()
      }
      const webContents = {
        downloadURL: jest.fn()
      }
      const fileId = 123
      const url = 'http://example.com/file.png'

      const result = await verifyDownload({
        database,
        downloadId,
        downloadsWaitingForEula,
        fileId,
        url,
        webContents
      })

      expect(result).toEqual(false)

      expect(fetch).toHaveBeenCalledTimes(0)

      expect(database.updateFileById).toHaveBeenCalledTimes(0)

      expect(database.updateDownloadById).toHaveBeenCalledTimes(0)

      expect(sendToEula).toHaveBeenCalledTimes(0)
    })
  })

  describe('when the status is known', () => {
    test('returns false and sets the file state', async () => {
      const downloadId = 'mock-download-id'
      const downloadsWaitingForEula = {}
      const database = {
        getToken: jest.fn().mockResolvedValue({ token: null }),
        updateDownloadById: jest.fn(),
        updateFileById: jest.fn()
      }
      const webContents = {
        downloadURL: jest.fn()
      }
      const fileId = 123
      const url = 'http://example.com/file.png'

      const response = {
        ok: false,
        status: 403,
        statusText: 'Forbidden'
      }

      fetch.mockImplementationOnce(() => response)
      const result = await verifyDownload({
        database,
        downloadId,
        downloadsWaitingForEula,
        fileId,
        url,
        webContents
      })

      expect(result).toEqual(false)

      expect(fetch).toHaveBeenCalledTimes(1)
      expect(fetch).toHaveBeenCalledWith(
        'http://example.com/file.png',
        expect.objectContaining({
          follow: 20,
          headers: {},
          method: 'GET',
          size: 250
        })
      )

      expect(metricsLogger).toHaveBeenCalledTimes(1)
      expect(metricsLogger).toHaveBeenCalledWith(database, {
        eventType: metricsEvent.downloadErrored,
        data: {
          downloadId: downloadIdForMetrics(downloadId),
          reason: 'Error occured in verifyDownload, message: HTTP Error Response: 403 Forbidden'
        }
      })

      expect(database.updateDownloadById).toHaveBeenCalledTimes(0)

      expect(database.updateFileById).toHaveBeenCalledTimes(1)
      expect(database.updateFileById).toHaveBeenCalledWith(123, {
        errors: 'HTTP Error Response: 403 Forbidden',
        state: downloadStates.error
      })

      expect(sendToEula).toHaveBeenCalledTimes(0)
    })
  })

  describe('when the status is unknown', () => {
    test('returns false and sets the file state', async () => {
      const downloadId = 'mock-download-id'
      const downloadsWaitingForEula = {}
      const database = {
        getToken: jest.fn().mockResolvedValue({ token: null }),
        updateDownloadById: jest.fn(),
        updateFileById: jest.fn()
      }
      const webContents = {
        downloadURL: jest.fn()
      }
      const fileId = 123
      const url = 'http://example.com/file.png'

      fetch.mockImplementationOnce(() => undefined)

      const result = await verifyDownload({
        database,
        downloadId,
        downloadsWaitingForEula,
        fileId,
        url,
        webContents
      })

      expect(result).toEqual(false)

      expect(fetch).toHaveBeenCalledTimes(1)
      expect(fetch).toHaveBeenCalledWith(
        'http://example.com/file.png',
        expect.objectContaining({
          follow: 20,
          headers: {},
          method: 'GET',
          size: 250
        })
      )

      expect(metricsLogger).toHaveBeenCalledTimes(1)
      expect(metricsLogger).toHaveBeenCalledWith(database, {
        eventType: metricsEvent.downloadErrored,
        data: {
          downloadId: downloadIdForMetrics(downloadId),
          reason: 'Error occured in verifyDownload, message: This file could not be downloaded'
        }
      })

      expect(database.updateDownloadById).toHaveBeenCalledTimes(0)

      expect(database.updateFileById).toHaveBeenCalledTimes(1)
      expect(database.updateFileById).toHaveBeenCalledWith(123, {
        errors: 'This file could not be downloaded',
        state: downloadStates.error
      })

      expect(sendToEula).toHaveBeenCalledTimes(0)
    })
  })
})
