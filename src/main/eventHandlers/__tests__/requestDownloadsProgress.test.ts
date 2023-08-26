// @ts-nocheck

import MockDate from 'mockdate'

import requestDownloadsProgress from '../requestDownloadsProgress'

import downloadStates from '../../../app/constants/downloadStates'

beforeEach(() => {
  MockDate.set('2023-05-13T22:00:00')
})

describe('requestDownloadsProgress', () => {
  test('returns an empty report when no downloads exist', async () => {
    const database = {
      getAllDownloadsCount: jest.fn()
        .mockResolvedValue(0),
      getDownloadsReport: jest.fn(),
      getDownloadReport: jest.fn(),
      getErroredFiles: jest.fn(),
      getFilesTotals: jest.fn()
    }

    const result = await requestDownloadsProgress({
      database,
      info: {
        limit: 10,
        offset: 0
      }
    })

    expect(result).toEqual({
      downloadsReport: [],
      totalDownloads: 0
    })

    expect(database.getAllDownloadsCount).toHaveBeenCalledTimes(1)

    expect(database.getDownloadsReport).toHaveBeenCalledTimes(0)
    expect(database.getDownloadReport).toHaveBeenCalledTimes(0)
    expect(database.getErroredFiles).toHaveBeenCalledTimes(0)
  })

  test('returns the downloads report', async () => {
    const database = {
      getAllDownloadsCount: jest.fn()
        .mockResolvedValue(2),
      getDownloadsReport: jest.fn()
        .mockResolvedValue([
          {
            createdAt: 1692731224799,
            id: 'mock-download-id-1',
            loadingMoreFiles: 1,
            state: downloadStates.active,
            timeEnd: null,
            timeStart: 1692731225946
          },
          {
            createdAt: 1692731213513,
            id: 'mock-download-id-2',
            loadingMoreFiles: 0,
            state: downloadStates.active,
            timeEnd: null,
            timeStart: 1692731217041
          }
        ]),
      getDownloadReport: jest.fn()
        .mockResolvedValueOnce({
          percentSum: 0,
          erroredFiles: 0,
          totalFiles: 7,
          finishedFiles: 0
        })
        .mockResolvedValueOnce({
          percentSum: 546,
          erroredFiles: 0,
          totalFiles: 7,
          finishedFiles: 5
        }),
      getErroredFiles: jest.fn()
        .mockResolvedValue([]),
      getFilesTotals: jest.fn()
        .mockResolvedValue({
          totalCompletedFiles: 5,
          totalFiles: 14
        })
    }

    const result = await requestDownloadsProgress({
      database,
      info: {
        limit: 10,
        offset: 0
      }
    })

    expect(result).toEqual({
      downloadsReport: [{
        downloadId: 'mock-download-id-1',
        loadingMoreFiles: true,
        progress: {
          finishedFiles: 0,
          percent: 0,
          totalFiles: 7,
          totalTime: -8701625
        },
        state: 'ACTIVE'
      }, {
        downloadId: 'mock-download-id-2',
        loadingMoreFiles: false,
        progress: {
          finishedFiles: 5,
          percent: 78,
          totalFiles: 7,
          totalTime: -8701617
        },
        state: 'ACTIVE'
      }],
      errors: {},
      totalCompletedFiles: 5,
      totalDownloads: 2,
      totalFiles: 14
    })

    expect(database.getAllDownloadsCount).toHaveBeenCalledTimes(1)

    expect(database.getDownloadsReport).toHaveBeenCalledTimes(1)
    expect(database.getDownloadsReport).toHaveBeenCalledWith(10, 0)

    expect(database.getDownloadReport).toHaveBeenCalledTimes(2)
    expect(database.getDownloadReport).toHaveBeenCalledWith('mock-download-id-1')
    expect(database.getDownloadReport).toHaveBeenCalledWith('mock-download-id-2')

    expect(database.getErroredFiles).toHaveBeenCalledTimes(1)
  })

  test('returns the downloads report with errors', async () => {
    const database = {
      getAllDownloadsCount: jest.fn()
        .mockResolvedValue(2),
      getDownloadsReport: jest.fn()
        .mockResolvedValue([
          {
            createdAt: 1692731224799,
            id: 'mock-download-id-1',
            loadingMoreFiles: 1,
            state: downloadStates.active,
            timeEnd: null,
            timeStart: 1692731225946
          },
          {
            createdAt: 1692731213513,
            id: 'mock-download-id-2',
            loadingMoreFiles: 0,
            state: downloadStates.active,
            timeEnd: null,
            timeStart: 1692731217041
          }
        ]),
      getDownloadReport: jest.fn()
        .mockResolvedValueOnce({
          percentSum: 0,
          erroredFiles: 0,
          totalFiles: 7,
          finishedFiles: 0
        })
        .mockResolvedValueOnce({
          percentSum: 546,
          erroredFiles: 1,
          totalFiles: 7,
          finishedFiles: 5
        }),
      getErroredFiles: jest.fn()
        .mockResolvedValue([{
          downloadId: 'mock-download-id-2',
          numberErrors: 1
        }]),
      getFilesTotals: jest.fn()
        .mockResolvedValue({
          totalCompletedFiles: 5,
          totalFiles: 14
        })
    }

    const result = await requestDownloadsProgress({
      database,
      info: {
        limit: 10,
        offset: 0
      }
    })

    expect(result).toEqual({
      downloadsReport: [{
        downloadId: 'mock-download-id-1',
        loadingMoreFiles: true,
        progress: {
          finishedFiles: 0,
          percent: 0,
          totalFiles: 7,
          totalTime: -8701625
        },
        state: 'ACTIVE'
      }, {
        downloadId: 'mock-download-id-2',
        loadingMoreFiles: false,
        progress: {
          finishedFiles: 5,
          percent: 78,
          totalFiles: 7,
          totalTime: -8701617
        },
        state: 'ACTIVE'
      }],
      errors: {
        'mock-download-id-2': {
          numberErrors: 1
        }
      },
      totalCompletedFiles: 5,
      totalDownloads: 2,
      totalFiles: 14
    })

    expect(database.getAllDownloadsCount).toHaveBeenCalledTimes(1)

    expect(database.getDownloadsReport).toHaveBeenCalledTimes(1)
    expect(database.getDownloadsReport).toHaveBeenCalledWith(10, 0)

    expect(database.getDownloadReport).toHaveBeenCalledTimes(2)
    expect(database.getDownloadReport).toHaveBeenCalledWith('mock-download-id-1')
    expect(database.getDownloadReport).toHaveBeenCalledWith('mock-download-id-2')

    expect(database.getErroredFiles).toHaveBeenCalledTimes(1)
  })
})
