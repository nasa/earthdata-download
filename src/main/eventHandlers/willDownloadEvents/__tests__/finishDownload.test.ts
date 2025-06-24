// @ts-nocheck

import MockDate from 'mockdate'

import finishDownload from '../finishDownload'

import downloadIdForMetrics from '../../../utils/downloadIdForMetrics'
import downloadStates from '../../../../app/constants/downloadStates'
import metricsEvent from '../../../../app/constants/metricsEvent'

import metricsLogger from '../../../utils/metricsLogger'

beforeEach(() => {
  MockDate.set('2023-05-13T22:00:00.000')
  jest.clearAllMocks()
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
        fileCount: 10,
        receivedBytesSum: 461748278,
        totalBytesSum: 461748278,
        totalDownloadTime: 18938,
        erroredCount: 1,
        incompleteFileCount: 3,
        interruptedCanResumeCount: 1,
        interruptedCanNotResumeCount: 0,
        cancelledCount: 1,
        pauseCount: 2
      })
    }

    await finishDownload({
      database,
      downloadId: 'mock-download-id'
    })

    expect(metricsLogger).toHaveBeenCalledTimes(1)
    expect(metricsLogger).toHaveBeenCalledWith(database, {
      eventType: metricsEvent.downloadComplete,
      data: {
        downloadId: downloadIdForMetrics('mock-download-id'),
        receivedBytes: 461748278,
        totalBytes: 461748278,
        duration: '18.9',
        filesDownloaded: 10,
        filesErrored: 1,
        filesIncomplete: 3,
        filesInterruptedCanResume: 1,
        filesInterruptedCanNotResume: 0,
        filesCancelled: 1,
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
        erroredCount: 0,
        incompleteFileCount: 0,
        interruptedCount: 0,
        cancelledCount: 0,
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
