// @ts-nocheck

import { net } from 'electron'
import metricsEvent from '../../../app/constants/metricsEvent'
import metricsLogger from '../metricsLogger'
import config from '../../config.json'

jest.mock('electron', () => ({
  app: {
    getVersion: () => '1.0.0'
  },
  net: {
    fetch: jest.fn()
  }
}))

describe('metricsLogger', () => {
  const event = {
    eventType: metricsEvent.downloadComplete,
    data: {
      downloadId: '1010_Test',
      fileCount: 10,
      receivedBytes: 20480,
      totalBytes: 25600,
      filesDownloaded: 8,
      filesErrored: 2,
      duration: 14.1
    }
  }

  test('should not send any metrics when user hasn\'t opted in', async () => {
    const database = {
      getNotCompletedFilesCountByDownloadId: jest.fn().mockResolvedValue(1),
      updateDownloadById: jest.fn(),
      getPreferencesByField: jest.fn().mockResolvedValue(
        0
      ),
      getDownloadById: jest.fn().mockResolvedValue({
        clientId: 'test-client-id'
      })
    }

    await metricsLogger(database, event)

    expect(net.fetch).toHaveBeenCalledTimes(0)
  })

  test('should send a POST request to the specified logging endpoint when user allows metrics', async () => {
    const expectedBody = JSON.stringify({
      params: {
        ...event,
        data: {
          ...event.data,
          appVersion: '1.0.0',
          clientId: 'test-client-id'
        }
      }
    })

    const database = {
      getNotCompletedFilesCountByDownloadId: jest.fn().mockResolvedValue(1),
      updateDownloadById: jest.fn(),
      getPreferencesByField: jest.fn().mockResolvedValue(
        1
      ),
      getDownloadById: jest.fn().mockResolvedValue({
        clientId: 'test-client-id'
      })
    }

    await metricsLogger(database, event)

    expect(net.fetch).toHaveBeenCalledTimes(1)
    expect(net.fetch).toHaveBeenCalledWith(
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
      ),
      getDownloadById: jest.fn().mockResolvedValue({
        clientId: 'test-client-id'
      })
    }

    const expectedError = new Error('Request failed')

    net.fetch
      .mockImplementationOnce(() => {
        throw new Error('Request failed')
      })

    console.error = jest.fn()

    await metricsLogger(database, event)

    expect(net.fetch).toHaveBeenCalledTimes(1)

    expect(net.fetch).toHaveBeenCalledWith(
      config.logging,
      {
        method: 'POST',
        body: JSON.stringify({
          params: {
            ...event,
            data: {
              ...event.data,
              appVersion: '1.0.0',
              clientId: 'test-client-id'
            }
          }
        }),
        headers: {
          'Content-Type': 'application/json'
        }
      }
    )

    expect(console.error).toHaveBeenCalledWith(expectedError)
  })

  test('should include downloadIds and clientIds in the event data when multiple downloads are provided', async () => {
    const eventWithMultipleDownloads = {
      eventType: metricsEvent.downloadPause,
      data: {
        downloadIds: ['1010_Test', '2020_Test']
      }
    }

    const database = {
      getNotCompletedFilesCountByDownloadId: jest.fn().mockResolvedValue(1),
      updateDownloadById: jest.fn(),
      getPreferencesByField: jest.fn().mockResolvedValue(
        1
      ),
      getDownloadById: jest.fn().mockResolvedValue({
        clientId: 'test-client-id'
      })
    }

    await metricsLogger(database, eventWithMultipleDownloads)

    expect(net.fetch).toHaveBeenCalledTimes(1)
    expect(net.fetch).toHaveBeenCalledWith(
      config.logging,
      {
        method: 'POST',
        body: JSON.stringify({
          params: {
            ...eventWithMultipleDownloads,
            data: {
              ...eventWithMultipleDownloads.data,
              appVersion: '1.0.0',
              clientIds: ['test-client-id', 'test-client-id']
            }
          }
        }),
        headers: {
          'Content-Type': 'application/json'
        }
      }
    )
  })
})
