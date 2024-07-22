// @ts-nocheck

import fetch from 'node-fetch'
import metricsLogger from '../metricsLogger'
import config from '../../config.json'

jest.mock('electron', () => ({
  app: {
    getVersion: () => '1.0.0'
  }
}))

jest.mock('node-fetch', () => ({
  __esModule: true,
  default: jest.fn()
}))

describe('metricsLogger', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  const event = {
    eventType: 'DownloadComplete',
    data: {
      downloadId: '1010_Test',
      fileCount: 10,
      receivedBytes: 20480,
      totalBytes: 25600,
      filesDownloaded: 8,
      filesFailed: 2,
      duration: 14.1
    }
  }

  test('should not send any metrics when user hasn\'t opted in', async () => {
    const database = {
      getNotCompletedFilesCountByDownloadId: jest.fn().mockResolvedValue(1),
      updateDownloadById: jest.fn(),
      getPreferencesByField: jest.fn().mockResolvedValue(
        0
      )
    }

    await metricsLogger(database, event)

    expect(fetch).toHaveBeenCalledTimes(0)
  })

  test('should send a POST request to the specified logging endpoint when user allows metrics', async () => {
    const expectedBody = JSON.stringify({
      params: {
        ...event,
        appVersion: '1.0.0'
      }
    })

    const database = {
      getNotCompletedFilesCountByDownloadId: jest.fn().mockResolvedValue(1),
      updateDownloadById: jest.fn(),
      getPreferencesByField: jest.fn().mockResolvedValue(
        1
      )
    }

    await metricsLogger(database, event)

    expect(fetch).toHaveBeenCalledTimes(1)
    expect(fetch).toHaveBeenCalledWith(
      config.logging,
      {
        method: 'POST',
        body: expectedBody,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    )
  })

  test('should log an error when POST request fails', async () => {
    const database = {
      getNotCompletedFilesCountByDownloadId: jest.fn().mockResolvedValue(1),
      updateDownloadById: jest.fn(),
      getPreferencesByField: jest.fn().mockResolvedValue(
        1
      )
    }

    const expectedError = new Error('Request failed')

    fetch
      .mockImplementationOnce(() => {
        throw new Error('Request failed')
      })

    console.error = jest.fn()

    await metricsLogger(database, event)

    expect(fetch).toHaveBeenCalledTimes(1)

    expect(fetch).toHaveBeenCalledWith(
      config.logging,
      {
        method: 'POST',
        body: JSON.stringify({
          params: {
            ...event,
            appVersion: '1.0.0'
          }
        }),
        headers: {
          'Content-Type': 'application/json'
        }
      }
    )

    expect(console.error).toHaveBeenCalledWith(expectedError)
  })
})
