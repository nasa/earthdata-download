// @ts-nocheck

import fetch from 'node-fetch'
import metricsLogger from '../metricsLogger'
import config from '../../config.json'

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

  test('should send a POST request to the specified logging endpoint', async () => {
    const expectedBody = JSON.stringify({ params: event })

    await metricsLogger(event)

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
    const expectedError = new Error('Request failed');

    fetch
      .mockImplementationOnce(() => {
        throw new Error('Request failed')
      })

    console.error = jest.fn()

    await metricsLogger(event)

    expect(fetch).toHaveBeenCalledTimes(1)

    expect(fetch).toHaveBeenCalledWith(
      config.logging,
      {
        method: 'POST',
        body: JSON.stringify({ params: event }),
        headers: {
          'Content-Type': 'application/json'
        }
      }
    )

    expect(console.error).toHaveBeenCalledWith(expectedError)
  })
})
