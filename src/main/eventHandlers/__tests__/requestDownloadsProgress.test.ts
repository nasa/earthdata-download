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
      getFilesTotals: jest.fn(),
      getPausesSum: jest.fn()
    }

    const result = await requestDownloadsProgress({
      database,
      info: {
        active: true,
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
    expect(database.getPausesSum).toHaveBeenCalledTimes(0)
    expect(database.getFilesTotals).toHaveBeenCalledTimes(0)
  })

  test('returns the downloads report', async () => {
    const database = {
      getAllDownloadsCount: jest.fn()
        .mockResolvedValue(2),
      getDownloadsReport: jest.fn()
        .mockResolvedValue([
          {
            id: 'mock-download-id-1',
            loadingMoreFiles: 1,
            state: downloadStates.active,
            totalTime: 123000,
            cancelId: null,
            restartId: null
          },
          {
            id: 'mock-download-id-2',
            loadingMoreFiles: 0,
            state: downloadStates.active,
            totalTime: 123000,
            cancelId: null,
            restartId: null
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
        }),
      getPausesSum: jest.fn()
        .mockResolvedValue(null)
    }

    const result = await requestDownloadsProgress({
      database,
      info: {
        active: true,
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
          totalTime: 123000
        },
        state: downloadStates.active
      }, {
        downloadId: 'mock-download-id-2',
        loadingMoreFiles: false,
        progress: {
          finishedFiles: 5,
          percent: 78,
          totalFiles: 7,
          totalTime: 123000
        },
        state: downloadStates.active
      }],
      errors: {},
      totalCompletedFiles: 5,
      totalDownloads: 2,
      totalFiles: 14
    })

    expect(database.getAllDownloadsCount).toHaveBeenCalledTimes(1)

    expect(database.getDownloadsReport).toHaveBeenCalledTimes(1)
    expect(database.getDownloadsReport).toHaveBeenCalledWith(true, 10, 0)

    expect(database.getDownloadReport).toHaveBeenCalledTimes(2)
    expect(database.getDownloadReport).toHaveBeenCalledWith('mock-download-id-1')
    expect(database.getDownloadReport).toHaveBeenCalledWith('mock-download-id-2')

    expect(database.getErroredFiles).toHaveBeenCalledTimes(1)
    expect(database.getErroredFiles).toHaveBeenCalledWith()

    expect(database.getPausesSum).toHaveBeenCalledTimes(2)
    expect(database.getPausesSum).toHaveBeenCalledWith('mock-download-id-1')
    expect(database.getPausesSum).toHaveBeenCalledWith('mock-download-id-2')

    expect(database.getFilesTotals).toHaveBeenCalledTimes(1)
    expect(database.getFilesTotals).toHaveBeenCalledWith()
  })

  test('returns the downloads report when downloads have been paused', async () => {
    const database = {
      getAllDownloadsCount: jest.fn()
        .mockResolvedValue(2),
      getDownloadsReport: jest.fn()
        .mockResolvedValue([
          {
            id: 'mock-download-id-1',
            loadingMoreFiles: 1,
            state: downloadStates.active,
            totalTime: 123000,
            cancelId: null,
            restartId: null
          },
          {
            id: 'mock-download-id-2',
            loadingMoreFiles: 0,
            state: downloadStates.active,
            totalTime: 123000,
            cancelId: null,
            restartId: null
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
        }),
      getPausesSum: jest.fn()
        .mockResolvedValue(10000)
    }

    const result = await requestDownloadsProgress({
      database,
      info: {
        active: true,
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
          totalTime: 113000
        },
        state: downloadStates.active
      }, {
        downloadId: 'mock-download-id-2',
        loadingMoreFiles: false,
        progress: {
          finishedFiles: 5,
          percent: 78,
          totalFiles: 7,
          totalTime: 113000
        },
        state: downloadStates.active
      }],
      errors: {},
      totalCompletedFiles: 5,
      totalDownloads: 2,
      totalFiles: 14
    })

    expect(database.getAllDownloadsCount).toHaveBeenCalledTimes(1)

    expect(database.getDownloadsReport).toHaveBeenCalledTimes(1)
    expect(database.getDownloadsReport).toHaveBeenCalledWith(true, 10, 0)

    expect(database.getDownloadReport).toHaveBeenCalledTimes(2)
    expect(database.getDownloadReport).toHaveBeenCalledWith('mock-download-id-1')
    expect(database.getDownloadReport).toHaveBeenCalledWith('mock-download-id-2')

    expect(database.getErroredFiles).toHaveBeenCalledTimes(1)
    expect(database.getErroredFiles).toHaveBeenCalledWith()

    expect(database.getPausesSum).toHaveBeenCalledTimes(2)
    expect(database.getPausesSum).toHaveBeenCalledWith('mock-download-id-1')
    expect(database.getPausesSum).toHaveBeenCalledWith('mock-download-id-2')

    expect(database.getFilesTotals).toHaveBeenCalledTimes(1)
    expect(database.getFilesTotals).toHaveBeenCalledWith()
  })

  test('returns the downloads report with errors', async () => {
    const database = {
      getAllDownloadsCount: jest.fn()
        .mockResolvedValue(2),
      getDownloadsReport: jest.fn()
        .mockResolvedValue([
          {
            id: 'mock-download-id-1',
            loadingMoreFiles: 1,
            state: downloadStates.active,
            totalTime: 123000,
            cancelId: null,
            restartId: null
          },
          {
            id: 'mock-download-id-2',
            loadingMoreFiles: 0,
            state: downloadStates.active,
            totalTime: 123000,
            cancelId: null,
            restartId: null
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
          active: 1,
          downloadId: 'mock-download-id-2',
          numberErrors: 1
        }]),
      getFilesTotals: jest.fn()
        .mockResolvedValue({
          totalCompletedFiles: 5,
          totalFiles: 14
        }),
      getPausesSum: jest.fn()
        .mockResolvedValue(null)
    }

    const result = await requestDownloadsProgress({
      database,
      info: {
        active: true,
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
          totalTime: 123000
        },
        state: downloadStates.active
      }, {
        downloadId: 'mock-download-id-2',
        loadingMoreFiles: false,
        progress: {
          finishedFiles: 5,
          percent: 78,
          totalFiles: 7,
          totalTime: 123000
        },
        state: downloadStates.active
      }],
      errors: {
        'mock-download-id-2': {
          active: 1,
          numberErrors: 1
        }
      },
      totalCompletedFiles: 5,
      totalDownloads: 2,
      totalFiles: 14
    })

    expect(database.getAllDownloadsCount).toHaveBeenCalledTimes(1)

    expect(database.getDownloadsReport).toHaveBeenCalledTimes(1)
    expect(database.getDownloadsReport).toHaveBeenCalledWith(true, 10, 0)

    expect(database.getDownloadReport).toHaveBeenCalledTimes(2)
    expect(database.getDownloadReport).toHaveBeenCalledWith('mock-download-id-1')
    expect(database.getDownloadReport).toHaveBeenCalledWith('mock-download-id-2')

    expect(database.getErroredFiles).toHaveBeenCalledTimes(1)
    expect(database.getErroredFiles).toHaveBeenCalledWith()

    expect(database.getPausesSum).toHaveBeenCalledTimes(2)
    expect(database.getPausesSum).toHaveBeenCalledWith('mock-download-id-1')
    expect(database.getPausesSum).toHaveBeenCalledWith('mock-download-id-2')

    expect(database.getFilesTotals).toHaveBeenCalledTimes(1)
    expect(database.getFilesTotals).toHaveBeenCalledWith()
  })

  test('returns the downloads report when active is false', async () => {
    const database = {
      getAllDownloadsCount: jest.fn()
        .mockResolvedValue(2),
      getDownloadsReport: jest.fn()
        .mockResolvedValue([
          {
            id: 'mock-download-id-1',
            loadingMoreFiles: 1,
            state: downloadStates.active,
            totalTime: 123000,
            cancelId: null,
            restartId: null
          },
          {
            id: 'mock-download-id-2',
            loadingMoreFiles: 0,
            state: downloadStates.active,
            totalTime: 123000,
            cancelId: null,
            restartId: null
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
          active: 1,
          downloadId: 'mock-download-id-2',
          numberErrors: 1
        }]),
      getFilesTotals: jest.fn(),
      getPausesSum: jest.fn()
        .mockResolvedValue(null)
    }

    const result = await requestDownloadsProgress({
      database,
      info: {
        active: false,
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
          totalTime: 123000
        },
        state: downloadStates.active
      }, {
        downloadId: 'mock-download-id-2',
        loadingMoreFiles: false,
        progress: {
          finishedFiles: 5,
          percent: 78,
          totalFiles: 7,
          totalTime: 123000
        },
        state: downloadStates.active
      }],
      errors: {
        'mock-download-id-2': {
          active: 1,
          numberErrors: 1
        }
      },
      totalCompletedFiles: undefined,
      totalDownloads: 2,
      totalFiles: undefined
    })

    expect(database.getAllDownloadsCount).toHaveBeenCalledTimes(1)

    expect(database.getDownloadsReport).toHaveBeenCalledTimes(1)
    expect(database.getDownloadsReport).toHaveBeenCalledWith(false, 10, 0)

    expect(database.getDownloadReport).toHaveBeenCalledTimes(2)
    expect(database.getDownloadReport).toHaveBeenCalledWith('mock-download-id-1')
    expect(database.getDownloadReport).toHaveBeenCalledWith('mock-download-id-2')

    expect(database.getErroredFiles).toHaveBeenCalledTimes(1)

    expect(database.getPausesSum).toHaveBeenCalledTimes(2)
    expect(database.getPausesSum).toHaveBeenCalledWith('mock-download-id-1')
    expect(database.getPausesSum).toHaveBeenCalledWith('mock-download-id-2')

    expect(database.getFilesTotals).toHaveBeenCalledTimes(0)
  })

  test('returns the downloads report when downloads have been restarted', async () => {
    const database = {
      getAllDownloadsCount: jest.fn()
        .mockResolvedValue(2),
      getDownloadsReport: jest.fn()
        .mockResolvedValue([
          {
            id: 'mock-download-id-1',
            loadingMoreFiles: 1,
            state: downloadStates.active,
            totalTime: 123000,
            cancelId: null,
            restartId: null
          },
          {
            id: 'mock-download-id-2',
            loadingMoreFiles: 0,
            state: downloadStates.active,
            totalTime: 123000,
            cancelId: null,
            restartId: 'mock-restart-id'
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
        }),
      getPausesSum: jest.fn()
        .mockResolvedValue(null)
    }

    const result = await requestDownloadsProgress({
      database,
      info: {
        active: true,
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
          totalTime: 123000
        },
        state: downloadStates.active
      }, {
        downloadId: 'mock-download-id-2',
        loadingMoreFiles: false,
        progress: {
          finishedFiles: 0,
          percent: 0,
          totalFiles: 7,
          totalTime: 0
        },
        state: downloadStates.pending,
        timeStart: null
      }],
      errors: {},
      totalCompletedFiles: 5,
      totalDownloads: 2,
      totalFiles: 14
    })

    expect(database.getAllDownloadsCount).toHaveBeenCalledTimes(1)

    expect(database.getDownloadsReport).toHaveBeenCalledTimes(1)
    expect(database.getDownloadsReport).toHaveBeenCalledWith(true, 10, 0)

    expect(database.getDownloadReport).toHaveBeenCalledTimes(2)
    expect(database.getDownloadReport).toHaveBeenCalledWith('mock-download-id-1')
    expect(database.getDownloadReport).toHaveBeenCalledWith('mock-download-id-2')

    expect(database.getErroredFiles).toHaveBeenCalledTimes(1)
    expect(database.getErroredFiles).toHaveBeenCalledWith()

    expect(database.getPausesSum).toHaveBeenCalledTimes(2)
    expect(database.getPausesSum).toHaveBeenCalledWith('mock-download-id-1')
    expect(database.getPausesSum).toHaveBeenCalledWith('mock-download-id-2')

    expect(database.getFilesTotals).toHaveBeenCalledTimes(1)
    expect(database.getFilesTotals).toHaveBeenCalledWith()
  })

  test('returns the downloads report when downloads have been cancelled', async () => {
    const database = {
      getAllDownloadsCount: jest.fn()
        .mockResolvedValue(2),
      getDownloadsReport: jest.fn()
        .mockResolvedValue([
          {
            id: 'mock-download-id-1',
            loadingMoreFiles: 1,
            state: downloadStates.active,
            totalTime: 123000,
            cancelId: null,
            restartId: null
          },
          {
            id: 'mock-download-id-2',
            loadingMoreFiles: 0,
            state: downloadStates.active,
            totalTime: 123000,
            cancelId: 'mock-cancel-id',
            restartId: null
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
        }),
      getPausesSum: jest.fn()
        .mockResolvedValue(null)
    }

    const result = await requestDownloadsProgress({
      database,
      info: {
        active: true,
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
          totalTime: 123000
        },
        state: downloadStates.active
      }, {
        downloadId: 'mock-download-id-2',
        loadingMoreFiles: false,
        progress: {
          finishedFiles: 5,
          percent: 78,
          totalFiles: 7,
          totalTime: 123000
        },
        state: downloadStates.cancelled,
        timeStart: null
      }],
      errors: {},
      totalCompletedFiles: 5,
      totalDownloads: 2,
      totalFiles: 14
    })

    expect(database.getAllDownloadsCount).toHaveBeenCalledTimes(1)

    expect(database.getDownloadsReport).toHaveBeenCalledTimes(1)
    expect(database.getDownloadsReport).toHaveBeenCalledWith(true, 10, 0)

    expect(database.getDownloadReport).toHaveBeenCalledTimes(2)
    expect(database.getDownloadReport).toHaveBeenCalledWith('mock-download-id-1')
    expect(database.getDownloadReport).toHaveBeenCalledWith('mock-download-id-2')

    expect(database.getErroredFiles).toHaveBeenCalledTimes(1)
    expect(database.getErroredFiles).toHaveBeenCalledWith()

    expect(database.getPausesSum).toHaveBeenCalledTimes(2)
    expect(database.getPausesSum).toHaveBeenCalledWith('mock-download-id-1')
    expect(database.getPausesSum).toHaveBeenCalledWith('mock-download-id-2')

    expect(database.getFilesTotals).toHaveBeenCalledTimes(1)
    expect(database.getFilesTotals).toHaveBeenCalledWith()
  })
})
