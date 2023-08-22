// @ts-nocheck

import MockDate from 'mockdate'

import requestFilesProgress from '../requestFilesProgress'

import downloadStates from '../../../app/constants/downloadStates'

beforeEach(() => {
  MockDate.set('2023-05-13T22:00:00')
})

describe('requestFilesProgress', () => {
  test.only('reports the file progress', async () => {
    const database = {
      getFilesReport: jest.fn()
        .mockResolvedValue([{
          downloadId: 'mock-download-id',
          filename: 'file1.png',
          state: downloadStates.completed,
          percent: 100,
          receivedBytes: 24902726,
          totalBytes: 24902726,
          remainingTime: 0
        }]),
      getFilesHeaderReport: jest.fn()
        .mockResolvedValue({
          id: 'mock-download-id',
          downloadLocation: '/mock/download/location/mock-download-id',
          state: downloadStates.completed,
          createdAt: 1692631408517,
          timeEnd: null,
          timeStart: 1692631432432,
          percentSum: 538,
          receivedBytesSum: 123957815,
          totalBytesSum: 159494477,
          totalFiles: 67,
          filesWithProgress: 7,
          finishedFiles: 4,
          erroredFiles: 0
        }),
      getTotalFilesPerFilesReport: jest.fn()
        .mockResolvedValue(67)
    }

    const result = await requestFilesProgress({
      database,
      info: {
        downloadId: 'mock-download-id',
        limit: 1,
        offset: 20,
        hideCompleted: false
      }
    })

    expect(result).toEqual({
      filesReport: {
        files: [{
          downloadId: 'mock-download-id',
          filename: 'file1.png',
          percent: 100,
          receivedBytes: 24902726,
          remainingTime: 0,
          state: 'COMPLETED',
          totalBytes: 24902726
        }],
        totalFiles: 67
      },
      headerReport: {
        createdAt: 1692631408517,
        downloadLocation: '/mock/download/location/mock-download-id',
        elapsedTime: -8601832,
        erroredFiles: 0,
        estimatedTotalTimeRemaining: -105934996.21220204,
        filesWithProgress: 7,
        finishedFiles: 4,
        id: 'mock-download-id',
        percent: 8,
        percentSum: 538,
        receivedBytesSum: 123957815,
        state: 'COMPLETED',
        timeEnd: null,
        timeStart: 1692631432432,
        totalBytesSum: 159494477,
        totalFiles: 67
      }
    })

    expect(database.getFilesReport).toHaveBeenCalledTimes(1)
    expect(database.getFilesReport).toHaveBeenCalledWith({
      downloadId: 'mock-download-id',
      hideCompleted: false,
      limit: 1,
      offset: 20
    })

    expect(database.getFilesHeaderReport).toHaveBeenCalledTimes(1)
    expect(database.getFilesHeaderReport).toHaveBeenCalledWith('mock-download-id')

    expect(database.getTotalFilesPerFilesReport).toHaveBeenCalledTimes(1)
    expect(database.getTotalFilesPerFilesReport).toHaveBeenCalledWith({
      downloadId: 'mock-download-id',
      hideCompleted: false
    })
  })

  test.only('reports the file progress with completed files hidden', async () => {
    const database = {
      getFilesReport: jest.fn()
        .mockResolvedValue([{
          downloadId: 'mock-download-id',
          filename: 'file1.png',
          state: downloadStates.completed,
          percent: 100,
          receivedBytes: 24902726,
          totalBytes: 24902726,
          remainingTime: 0
        }]),
      getFilesHeaderReport: jest.fn()
        .mockResolvedValue({
          id: 'mock-download-id',
          downloadLocation: '/mock/download/location/mock-download-id',
          state: downloadStates.completed,
          createdAt: 1692631408517,
          timeEnd: null,
          timeStart: 1692631432432,
          percentSum: 538,
          receivedBytesSum: 123957815,
          totalBytesSum: 159494477,
          totalFiles: 67,
          filesWithProgress: 7,
          finishedFiles: 4,
          erroredFiles: 0
        }),
      getTotalFilesPerFilesReport: jest.fn()
        .mockResolvedValue(70)
    }

    const result = await requestFilesProgress({
      database,
      info: {
        downloadId: 'mock-download-id',
        limit: 1,
        offset: 20,
        hideCompleted: true
      }
    })

    expect(result).toEqual({
      filesReport: {
        files: [{
          downloadId: 'mock-download-id',
          filename: 'file1.png',
          percent: 100,
          receivedBytes: 24902726,
          remainingTime: 0,
          state: 'COMPLETED',
          totalBytes: 24902726
        }],
        totalFiles: 70
      },
      headerReport: {
        createdAt: 1692631408517,
        downloadLocation: '/mock/download/location/mock-download-id',
        elapsedTime: -8601832,
        erroredFiles: 0,
        estimatedTotalTimeRemaining: -105934996.21220204,
        filesWithProgress: 7,
        finishedFiles: 4,
        id: 'mock-download-id',
        percent: 8,
        percentSum: 538,
        receivedBytesSum: 123957815,
        state: 'COMPLETED',
        timeEnd: null,
        timeStart: 1692631432432,
        totalBytesSum: 159494477,
        totalFiles: 67
      }
    })

    expect(database.getFilesReport).toHaveBeenCalledTimes(1)
    expect(database.getFilesReport).toHaveBeenCalledWith({
      downloadId: 'mock-download-id',
      hideCompleted: true,
      limit: 1,
      offset: 20
    })

    expect(database.getFilesHeaderReport).toHaveBeenCalledTimes(1)
    expect(database.getFilesHeaderReport).toHaveBeenCalledWith('mock-download-id')

    expect(database.getTotalFilesPerFilesReport).toHaveBeenCalledTimes(1)
    expect(database.getTotalFilesPerFilesReport).toHaveBeenCalledWith({
      downloadId: 'mock-download-id',
      hideCompleted: true
    })
  })
})
