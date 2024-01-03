// @ts-nocheck

import MockDate from 'mockdate'

import finishDownload from '../finishDownload'

import downloadStates from '../../../../app/constants/downloadStates'

import metricsLogger from '../../../utils/metricsLogger'

beforeEach(() => {
  MockDate.set('2023-05-13T22:00:00.000')
})

jest.mock('../../../utils/metricsLogger.ts', () => ({
  __esModule: true,
  default: jest.fn(() => {})
}))

describe('finishDownload', () => {
  test('marks the download as completed if all files are completed', async () => {
    const database = {
      getNotCompletedFilesCountByDownloadId: jest.fn().mockResolvedValue(0),
      updateDownloadById: jest.fn(),
      getDownloadStatistics: jest.fn().mockResolvedValue({
        fileCount: 7,
        receivedBytesSum: 461748278,
        totalBytesSum: 461748278,
        totalDownloadTime: 18938,
        incompleteFileCount: 0,
        pauseCount: 2
      })
    }

    await finishDownload({
      database,
      downloadId: 'mock-download-id'
    })

    expect(metricsLogger).toHaveBeenCalledTimes(1)
    expect(metricsLogger).toHaveBeenCalledWith(database, {
      eventType: 'DownloadComplete',
      data: {
        downloadId: 'mock-download-id',
        receivedBytes: 461748278,
        totalBytes: 461748278,
        duration: '18.9',
        filesFailed: 0,
        filesDownloaded: 7,
        pauseCount: 2
      }
    })

    expect(database.updateDownloadById).toHaveBeenCalledTimes(1)
    expect(database.updateDownloadById).toHaveBeenCalledWith(
      'mock-download-id',
      {
        state: downloadStates.completed,
        timeEnd: 1684029600000
      }
    )

    expect(database.getDownloadStatistics).toHaveBeenCalledTimes(1)
  })

  test('does not mark the download as completed if files are still downloading', async () => {
    const database = {
      getNotCompletedFilesCountByDownloadId: jest.fn().mockResolvedValue(1),
      updateDownloadById: jest.fn(),
      getDownloadStatistics: jest.fn().mockResolvedValue({
        fileCount: 7,
        receivedBytesSum: 461748278,
        totalBytesSum: 461748278,
        totalDownloadTime: 18938,
        incompleteFileCount: 0,
        pauseCount: 2
      })
    }

    await finishDownload({
      database,
      downloadId: 'mock-download-id'
    })

    expect(metricsLogger).toHaveBeenCalledTimes(0)

    expect(database.updateDownloadById).toHaveBeenCalledTimes(0)

    expect(database.getDownloadStatistics).toHaveBeenCalledTimes(0)
  })
})
