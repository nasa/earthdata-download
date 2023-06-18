import MockDate from 'mockdate'

import finishDownload from '../finishDownload'

beforeEach(() => {
  MockDate.set('2023-05-13T22:00:00.000')
})

describe('finishDownload', () => {
  test('marks the download as completed if all files are completed', async () => {
    const database = {
      getNotCompletedFilesCountByDownloadId: jest.fn().mockResolvedValue(0),
      updateDownloadById: jest.fn()
    }

    await finishDownload({
      database,
      downloadId: 'mock-download-id'
    })

    expect(database.updateDownloadById).toHaveBeenCalledTimes(1)
    expect(database.updateDownloadById).toHaveBeenCalledWith(
      'mock-download-id',
      {
        state: 'COMPLETED',
        timeEnd: 1684029600000
      }
    )
  })

  test('does not mark the download as completed if files are still downloading', async () => {
    const database = {
      getNotCompletedFilesCountByDownloadId: jest.fn().mockResolvedValue(1),
      updateDownloadById: jest.fn()
    }

    await finishDownload({
      database,
      downloadId: 'mock-download-id'
    })

    expect(database.updateDownloadById).toHaveBeenCalledTimes(0)
  })
})
