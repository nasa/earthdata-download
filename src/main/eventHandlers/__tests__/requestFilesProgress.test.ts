// @ts-nocheck

import MockDate from 'mockdate'

import requestFilesProgress from '../requestFilesProgress'

import downloadStates from '../../../app/constants/downloadStates'

beforeEach(() => {
  MockDate.set('2023-08-30T22:00:00')
})

describe('requestFilesProgress', () => {
  test('reports the file progress', async () => {
    const database = {
      getFilesReport: jest.fn()
        .mockResolvedValue([{
          downloadId: 'mock-download-id',
          filename: 'file1.png',
          state: downloadStates.completed,
          percent: 100,
          receivedBytes: 24902726,
          totalBytes: 24902726,
          remainingTime: 0,
          cancelId: null,
          restartId: null
        }]),
      getFilesHeaderReport: jest.fn()
        .mockResolvedValue({
          id: 'mock-download-id',
          downloadLocation: '/mock/download/location/mock-download-id',
          state: downloadStates.completed,
          totalTime: 123000,
          percentSum: 538,
          receivedBytesSum: 123957815,
          totalBytesSum: 159494477,
          totalFiles: 67,
          filesWithProgress: 7,
          finishedFiles: 4
        }),
      getTotalFilesPerFilesReport: jest.fn()
        .mockResolvedValue(67),
      getErroredFiles: jest.fn()
        .mockResolvedValue([]),
      getPausesSum: jest.fn()
        .mockResolvedValue(null)
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
          state: downloadStates.completed,
          totalBytes: 24902726,
          cancelId: null,
          restartId: null
        }],
        totalFiles: 67
      },
      headerReport: {
        downloadLocation: '/mock/download/location/mock-download-id',
        elapsedTime: 123000,
        errors: {},
        estimatedTotalTimeRemaining: 1514794.1199154847,
        filesWithProgress: 7,
        finishedFiles: 4,
        id: 'mock-download-id',
        percent: 8,
        percentSum: 538,
        receivedBytesSum: 123957815,
        state: downloadStates.completed,
        totalBytesSum: 159494477,
        totalFiles: 67,
        totalTime: 123000
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

  test('reports the file progress with completed files hidden', async () => {
    const database = {
      getFilesReport: jest.fn()
        .mockResolvedValue([{
          downloadId: 'mock-download-id',
          filename: 'file1.png',
          state: downloadStates.completed,
          percent: 100,
          receivedBytes: 24902726,
          totalBytes: 24902726,
          remainingTime: 0,
          cancelId: null,
          restartId: null
        }]),
      getFilesHeaderReport: jest.fn()
        .mockResolvedValue({
          id: 'mock-download-id',
          downloadLocation: '/mock/download/location/mock-download-id',
          state: downloadStates.completed,
          totalTime: 123000,
          percentSum: 538,
          receivedBytesSum: 123957815,
          totalBytesSum: 159494477,
          totalFiles: 67,
          filesWithProgress: 7,
          finishedFiles: 4
        }),
      getTotalFilesPerFilesReport: jest.fn()
        .mockResolvedValue(70),
      getErroredFiles: jest.fn()
        .mockResolvedValue([{
          active: 1,
          downloadId: 'mock-download-id-2',
          numberErrors: 1
        }]),
      getPausesSum: jest.fn()
        .mockResolvedValue(null)
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
          state: downloadStates.completed,
          totalBytes: 24902726,
          cancelId: null,
          restartId: null
        }],
        totalFiles: 70
      },
      headerReport: {
        downloadLocation: '/mock/download/location/mock-download-id',
        elapsedTime: 123000,
        errors: {
          'mock-download-id-2': {
            active: 1,
            numberErrors: 1
          }
        },
        estimatedTotalTimeRemaining: 1514794.1199154847,
        filesWithProgress: 7,
        finishedFiles: 4,
        id: 'mock-download-id',
        percent: 8,
        percentSum: 538,
        receivedBytesSum: 123957815,
        state: downloadStates.completed,
        totalBytesSum: 159494477,
        totalFiles: 67,
        totalTime: 123000
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

  test('reports the file progress when files have been paused', async () => {
    const database = {
      getFilesReport: jest.fn()
        .mockResolvedValue([{
          downloadId: 'mock-download-id',
          filename: 'file1.png',
          state: downloadStates.completed,
          percent: 100,
          receivedBytes: 24902726,
          totalBytes: 24902726,
          remainingTime: 0,
          cancelId: null,
          restartId: null
        }]),
      getFilesHeaderReport: jest.fn()
        .mockResolvedValue({
          id: 'mock-download-id',
          downloadLocation: '/mock/download/location/mock-download-id',
          state: downloadStates.completed,
          totalTime: 123000,
          percentSum: 538,
          receivedBytesSum: 123957815,
          totalBytesSum: 159494477,
          totalFiles: 67,
          filesWithProgress: 7,
          finishedFiles: 4
        }),
      getTotalFilesPerFilesReport: jest.fn()
        .mockResolvedValue(67),
      getErroredFiles: jest.fn()
        .mockResolvedValue([]),
      getPausesSum: jest.fn()
        .mockResolvedValue(10000)
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
          state: downloadStates.completed,
          totalBytes: 24902726,
          cancelId: null,
          restartId: null
        }],
        totalFiles: 67
      },
      headerReport: {
        downloadLocation: '/mock/download/location/mock-download-id',
        elapsedTime: 113000,
        errors: {},
        estimatedTotalTimeRemaining: 1391640.1264264206,
        filesWithProgress: 7,
        finishedFiles: 4,
        id: 'mock-download-id',
        percent: 8,
        percentSum: 538,
        receivedBytesSum: 123957815,
        state: downloadStates.completed,
        totalBytesSum: 159494477,
        totalFiles: 67,
        totalTime: 123000
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

  test('reports the file progress when files have been restarted', async () => {
    const database = {
      getFilesReport: jest.fn()
        .mockResolvedValue([{
          downloadId: 'mock-download-id',
          filename: 'file1.png',
          state: downloadStates.completed,
          percent: 100,
          receivedBytes: 24902726,
          totalBytes: 24902726,
          remainingTime: 0,
          cancelId: null,
          restartId: 'mock-restart-id'
        }]),
      getFilesHeaderReport: jest.fn()
        .mockResolvedValue({
          id: 'mock-download-id',
          downloadLocation: '/mock/download/location/mock-download-id',
          state: downloadStates.completed,
          totalTime: 123000,
          percentSum: 538,
          receivedBytesSum: 123957815,
          totalBytesSum: 159494477,
          totalFiles: 67,
          filesWithProgress: 7,
          finishedFiles: 4
        }),
      getTotalFilesPerFilesReport: jest.fn()
        .mockResolvedValue(67),
      getErroredFiles: jest.fn()
        .mockResolvedValue([]),
      getPausesSum: jest.fn()
        .mockResolvedValue(10000)
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
          percent: 0,
          receivedBytes: 0,
          remainingTime: 0,
          state: downloadStates.pending,
          totalBytes: 0,
          cancelId: null,
          restartId: 'mock-restart-id'
        }],
        totalFiles: 67
      },
      headerReport: {
        downloadLocation: '/mock/download/location/mock-download-id',
        elapsedTime: 113000,
        errors: {},
        estimatedTotalTimeRemaining: 1391640.1264264206,
        filesWithProgress: 7,
        finishedFiles: 4,
        id: 'mock-download-id',
        percent: 8,
        percentSum: 538,
        receivedBytesSum: 123957815,
        state: downloadStates.completed,
        totalBytesSum: 159494477,
        totalFiles: 67,
        totalTime: 123000
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

  test('reports the file progress when files have been cancelled', async () => {
    const database = {
      getFilesReport: jest.fn()
        .mockResolvedValue([{
          downloadId: 'mock-download-id',
          filename: 'file1.png',
          state: downloadStates.completed,
          percent: 100,
          receivedBytes: 24902726,
          totalBytes: 24902726,
          remainingTime: 0,
          restartId: null,
          cancelId: 'mock-cancel-id'
        }, {
          downloadId: 'mock-download-id',
          filename: 'file2.png',
          state: downloadStates.active,
          percent: 50,
          receivedBytes: 12451363,
          totalBytes: 24902726,
          remainingTime: 123000,
          restartId: null,
          cancelId: 'mock-cancel-id'
        }]),
      getFilesHeaderReport: jest.fn()
        .mockResolvedValue({
          id: 'mock-download-id',
          downloadLocation: '/mock/download/location/mock-download-id',
          state: downloadStates.completed,
          totalTime: 123000,
          percentSum: 538,
          receivedBytesSum: 123957815,
          totalBytesSum: 159494477,
          totalFiles: 67,
          filesWithProgress: 7,
          finishedFiles: 4
        }),
      getTotalFilesPerFilesReport: jest.fn()
        .mockResolvedValue(67),
      getErroredFiles: jest.fn()
        .mockResolvedValue([]),
      getPausesSum: jest.fn()
        .mockResolvedValue(10000)
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
          totalBytes: 24902726,
          state: downloadStates.completed,
          remainingTime: 0,
          restartId: null,
          cancelId: 'mock-cancel-id'
        }, {
          downloadId: 'mock-download-id',
          filename: 'file2.png',
          percent: 0,
          receivedBytes: 0,
          remainingTime: 0,
          state: downloadStates.cancelled,
          totalBytes: 0,
          restartId: null,
          cancelId: 'mock-cancel-id'
        }],
        totalFiles: 67
      },
      headerReport: {
        downloadLocation: '/mock/download/location/mock-download-id',
        elapsedTime: 113000,
        errors: {},
        estimatedTotalTimeRemaining: 1391640.1264264206,
        filesWithProgress: 7,
        finishedFiles: 4,
        id: 'mock-download-id',
        percent: 8,
        percentSum: 538,
        receivedBytesSum: 123957815,
        state: downloadStates.completed,
        totalBytesSum: 159494477,
        totalFiles: 67,
        totalTime: 123000
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
})
