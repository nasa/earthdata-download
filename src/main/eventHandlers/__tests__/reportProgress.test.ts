import MockDate from 'mockdate'

import reportProgress from '../reportProgress'

beforeEach(() => {
  MockDate.set('2023-05-13T22:00:00')
})

describe('reportProgress', () => {
  test('reports progress of collection downloads', async () => {
    const database = {
      getAllDownloads: jest.fn()
        .mockResolvedValue([{
          id: 'shortName_version-1-20230520_012000',
          downloadLocation: '/mock/location/shortName_version-1-20230520_012000',
          loadingMoreFiles: 1,
          timeStart: 1684027555379,
          state: 'PENDING',
          errorInfo: [],
          numErrors: 0
        }, {
          id: 'shortName_version-1-20230514_012999',
          downloadLocation: '/mock/location/shortName_version-1-20230514_012999',
          loadingMoreFiles: 0,
          timeStart: 1684027555379,
          state: 'ACTIVE',
          errorInfo: [],
          numErrors: 0
        }, {
          id: 'shortName_version-1-20230514_012554',
          downloadLocation: '/mock/location/shortName_version-1-20230514_012554',
          loadingMoreFiles: 0,
          timeStart: 1684027555382,
          state: 'ACTIVE',
          errorInfo: [],
          numErrors: 0
        }]),
      getFileStateCounts: jest.fn()
        .mockResolvedValueOnce({
          active: 0,
          completed: 0,
          error: 0,
          paused: 0
        })
        .mockResolvedValueOnce({
          active: 0,
          completed: 0,
          error: 0,
          paused: 0
        })
        .mockResolvedValueOnce({
          active: 1,
          completed: 1,
          error: 0,
          paused: 0
        }),
      getFilesWhere: jest.fn()
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([{
          id: 'STScI-01GHBZC0XR0DCJFZY0QXEH215V.png',
          downloadId: 'shortName_version-1-20230514_012999',
          url: 'https://stsci-opo.org/STScI-01GHBZC0XR0DCJFZY0QXEH215V.png',
          state: 'PENDING',
          percent: 0
        }, {
          id: 'STScI-01GGWD12YEES5K5163RJFYQT20.png',
          downloadId: 'shortName_version-1-20230514_012999',
          url: 'https://stsci-opo.org/STScI-01GGWD12YEES5K5163RJFYQT20.png',
          state: 'PENDING',
          percent: 0
        }, {
          id: 'STScI-01GGF8H15VZ09MET9HFBRQX4S3.png',
          downloadId: 'shortName_version-1-20230514_012999',
          url: 'https://stsci-opo.org/STScI-01GGF8H15VZ09MET9HFBRQX4S3.png',
          state: 'PENDING',
          percent: 0
        }, {
          id: 'STScI-01GA76Q01D09HFEV174SVMQDMV.png',
          downloadId: 'shortName_version-1-20230514_012999',
          url: 'https://stsci-opo.org/STScI-01GA76Q01D09HFEV174SVMQDMV.png',
          state: 'PENDING',
          percent: 0
        }, {
          id: 'STScI-01G9G4J23CDPVNGCYDJRZTTJQN.png',
          downloadId: 'shortName_version-1-20230514_012999',
          url: 'https://stsci-opo.org/STScI-01G9G4J23CDPVNGCYDJRZTTJQN.png',
          state: 'PENDING',
          percent: 0
        }, {
          id: 'STScI-01GS80QTFKXCEJEBGKV9SBEDJP.png',
          downloadId: 'shortName_version-1-20230514_012999',
          url: 'https://stsci-opo.org/STScI-01GS80QTFKXCEJEBGKV9SBEDJP.png',
          state: 'PENDING',
          percent: 0
        }, {
          id: 'STScI-01GWQDPJTF1MY8ZGN4WBMWMACJ.png',
          downloadId: 'shortName_version-1-20230514_012999',
          url: 'https://stsci-opo.org/STScI-01GWQDPJTF1MY8ZGN4WBMWMACJ.png',
          state: 'PENDING',
          percent: 0
        }])
        .mockResolvedValueOnce([{
          id: 'STScI-01GTYAME8Q4353E2WQQH2965S5.png',
          downloadId: 'shortName_version-1-20230514_012554',
          url: 'https://stsci-opo.org/STScI-01GTYAME8Q4353E2WQQH2965S5.png',
          state: 'COMPLETED',
          percent: 100
        }, {
          id: 'STScI-01G8H1K2BCNATEZSKVRN9Z69SR.png',
          downloadId: 'shortName_version-1-20230514_012554',
          url: 'https://stsci-opo.org/STScI-01G8H1K2BCNATEZSKVRN9Z69SR.png',
          state: 'ACTIVE',
          errorInfo: []
        }]),
      getDownloadFilesProgressByDownloadId: jest.fn()
        .mockResolvedValueOnce({
          percentSum: null,
          totalFiles: 0,
          finishedFiles: 0
        })
        .mockResolvedValueOnce({
          percentSum: 0,
          totalFiles: 7,
          finishedFiles: 0
        })
        .mockResolvedValueOnce({
          percentSum: 317,
          totalFiles: 8,
          finishedFiles: 2
        }),
      updateDownloadById: jest.fn()
    }
    const webContents = {
      send: jest.fn()
    }

    await reportProgress({ database, webContents })

    expect(database.getAllDownloads).toHaveBeenCalledTimes(1)

    expect(database.getDownloadFilesProgressByDownloadId).toHaveBeenCalledTimes(3)
    expect(database.getDownloadFilesProgressByDownloadId).toHaveBeenCalledWith('shortName_version-1-20230520_012000')
    expect(database.getDownloadFilesProgressByDownloadId).toHaveBeenCalledWith('shortName_version-1-20230514_012999')
    expect(database.getDownloadFilesProgressByDownloadId).toHaveBeenCalledWith('shortName_version-1-20230514_012554')

    expect(webContents.send).toHaveBeenCalledTimes(1)
    expect(webContents.send).toHaveBeenCalledWith('reportProgress', {
      progress: [{
        downloadId: 'shortName_version-1-20230520_012000',
        downloadName: 'shortName_version-1-20230520_012000',
        errorInfo: [],
        loadingMoreFiles: true,
        numErrors: 0,
        progress: {
          finishedFiles: 0,
          percent: 0,
          totalFiles: 0,
          totalTime: 2045
        },
        state: 'PENDING'
      }, {
        downloadId: 'shortName_version-1-20230514_012999',
        downloadName: 'shortName_version-1-20230514_012999',
        errorInfo: [],
        loadingMoreFiles: false,
        numErrors: 0,
        progress: {
          finishedFiles: 0,
          percent: 0,
          totalFiles: 7,
          totalTime: 2045
        },
        state: 'ACTIVE'
      }, {
        downloadId: 'shortName_version-1-20230514_012554',
        downloadName: 'shortName_version-1-20230514_012554',
        errorInfo: [],
        loadingMoreFiles: false,
        numErrors: 0,
        progress: {
          finishedFiles: 2,
          percent: 39.6,
          totalFiles: 8,
          totalTime: 2045
        },
        state: 'ACTIVE'
      }]
    })

    expect(database.updateDownloadById).toHaveBeenCalledTimes(1)
    expect(database.updateDownloadById).toHaveBeenCalledWith('shortName_version-1-20230514_012554', { state: 'ACTIVE' })
  })

  test('reports empty progress if no downloads exist', async () => {
    const database = {
      getAllDownloads: jest.fn().mockResolvedValue([])
    }
    const webContents = {
      send: jest.fn()
    }

    await reportProgress({ database, webContents })

    expect(webContents.send).toHaveBeenCalledTimes(1)
    expect(webContents.send).toHaveBeenCalledWith('reportProgress', { progress: [], errorInfo: [] })
  })

  test('updates state if a file download is in an errored state', async () => {
    const database = {
      getAllDownloads: jest.fn()
        .mockResolvedValue([{
          id: 'shortName_version-1-20230514_012999',
          downloadLocation: '/mock/location/shortName_version-1-20230514_012999',
          loadingMoreFiles: 0,
          timeStart: 1684027555382,
          state: 'ERROR',
          errorInfo: [],
          numErrors: 0
        }]),
      getFileStateCounts: jest.fn()
        .mockResolvedValueOnce({
          active: 3,
          completed: 1,
          error: 1,
          paused: 0
        }),
      getFilesWhere: jest.fn()
        .mockResolvedValueOnce([{
          filename: 'STScI-01GHBZC0XR0DCJFZY0QXEH215V.png',
          downloadId: 'shortName_version-1-20230514_012999',
          url: 'https://stsci-opo.org/STScI-01GHBZC0XR0DCJFZY0QXEH215V.png',
          state: 'ACTIVE',
          percent: 3
        }, {
          filename: 'STScI-01GGWD12YEES5K5163RJFYQT20.png',
          downloadId: 'shortName_version-1-20230514_012999',
          url: 'https://stsci-opo.org/STScI-01GGWD12YEES5K5163RJFYQT20.png',
          state: 'ACTIVE',
          percent: 5
        }, {
          filename: 'STScI-01GGF8H15VZ09MET9HFBRQX4S3.png',
          downloadId: 'shortName_version-1-20230514_012999',
          url: 'https://stsci-opo.org/STScI-01GGF8H15VZ09MET9HFBRQX4S3.png',
          state: 'ACTIVE',
          percent: 18
        }, {
          filename: 'STScI-01GA76Q01D09HFEV174SVMQDMV.png',
          downloadId: 'shortName_version-1-20230514_012999',
          url: 'https://stsci-opo.org/STScI-01GA76Q01D09HFEV174SVMQDMV.png',
          state: 'COMPLETED',
          percent: 100
        }, {
          filename: 'STScI-01G9G4J23CDPVNGCYDJRZTTJQN.png',
          downloadId: 'shortName_version-1-20230514_012999',
          url: 'https://stsci-opo.org/STScI-01G9G4J23CDPVNGCYDJRZTTJQN.png',
          state: 'ERROR',
          percent: 0
        }, {
          filename: 'STScI-01GS80QTFKXCEJEBGKV9SBEDJP.png',
          downloadId: 'shortName_version-1-20230514_012999',
          url: 'https://stsci-opo.org/STScI-01GS80QTFKXCEJEBGKV9SBEDJP.png',
          state: 'PENDING',
          percent: 0
        }, {
          filename: 'STScI-01GWQDPJTF1MY8ZGN4WBMWMACJ.png',
          downloadId: 'shortName_version-1-20230514_012999',
          url: 'https://stsci-opo.org/STScI-01GWQDPJTF1MY8ZGN4WBMWMACJ.png',
          state: 'PENDING',
          percent: 0
        }]),
      getDownloadFilesProgressByDownloadId: jest.fn()
        .mockResolvedValueOnce({
          percentSum: 126,
          totalFiles: 7,
          finishedFiles: 1
        }),
      updateDownloadById: jest.fn()
    }
    const webContents = {
      send: jest.fn()
    }

    await reportProgress({ database, webContents })

    expect(database.getAllDownloads).toHaveBeenCalledTimes(1)

    expect(database.getDownloadFilesProgressByDownloadId).toHaveBeenCalledTimes(1)
    expect(database.getDownloadFilesProgressByDownloadId).toHaveBeenCalledWith('shortName_version-1-20230514_012999')

    expect(webContents.send).toHaveBeenCalledTimes(1)
    expect(webContents.send).toHaveBeenCalledWith('reportProgress', {
      progress: [{
        downloadId: 'shortName_version-1-20230514_012999',
        downloadName: 'shortName_version-1-20230514_012999',
        errorInfo: [{
          filename: 'STScI-01G9G4J23CDPVNGCYDJRZTTJQN.png',
          url: 'https://stsci-opo.org/STScI-01G9G4J23CDPVNGCYDJRZTTJQN.png'
        }],
        loadingMoreFiles: false,
        numErrors: 1,
        progress: {
          finishedFiles: 1,
          percent: 18,
          totalFiles: 7,
          totalTime: 2045
        },
        state: 'ERROR'
      }]
    })

    expect(database.updateDownloadById).toHaveBeenCalledTimes(1)
    expect(database.updateDownloadById).toHaveBeenCalledWith('shortName_version-1-20230514_012999', { state: 'ERROR' })
  })

  test('updates state if a file download is in a completed state', async () => {
    const database = {
      getAllDownloads: jest.fn()
        .mockResolvedValue([{
          id: 'shortName_version-1-20230514_012999',
          downloadLocation: '/mock/location/shortName_version-1-20230514_012999',
          loadingMoreFiles: 0,
          timeStart: 1684027555382,
          state: 'COMPLETED',
          errorInfo: [],
          numErrors: 0
        }]),
      getFileStateCounts: jest.fn()
        .mockResolvedValueOnce({
          active: 0,
          completed: 7,
          error: 0,
          paused: 0
        }),
      getFilesWhere: jest.fn()
        .mockResolvedValueOnce([{
          filename: 'STScI-01GHBZC0XR0DCJFZY0QXEH215V.png',
          downloadId: 'shortName_version-1-20230514_012999',
          url: 'https://stsci-opo.org/STScI-01GHBZC0XR0DCJFZY0QXEH215V.png',
          state: 'COMPLETED',
          percent: 100
        }, {
          filename: 'STScI-01GGWD12YEES5K5163RJFYQT20.png',
          downloadId: 'shortName_version-1-20230514_012999',
          url: 'https://stsci-opo.org/STScI-01GGWD12YEES5K5163RJFYQT20.png',
          state: 'COMPLETED',
          percent: 100
        }, {
          filename: 'STScI-01GGF8H15VZ09MET9HFBRQX4S3.png',
          downloadId: 'shortName_version-1-20230514_012999',
          url: 'https://stsci-opo.org/STScI-01GGF8H15VZ09MET9HFBRQX4S3.png',
          state: 'COMPLETED',
          percent: 100
        }, {
          filename: 'STScI-01GA76Q01D09HFEV174SVMQDMV.png',
          downloadId: 'shortName_version-1-20230514_012999',
          url: 'https://stsci-opo.org/STScI-01GA76Q01D09HFEV174SVMQDMV.png',
          state: 'COMPLETED',
          percent: 100
        }, {
          filename: 'STScI-01G9G4J23CDPVNGCYDJRZTTJQN.png',
          downloadId: 'shortName_version-1-20230514_012999',
          url: 'https://stsci-opo.org/STScI-01G9G4J23CDPVNGCYDJRZTTJQN.png',
          state: 'COMPLETED',
          percent: 100
        }, {
          filename: 'STScI-01GS80QTFKXCEJEBGKV9SBEDJP.png',
          downloadId: 'shortName_version-1-20230514_012999',
          url: 'https://stsci-opo.org/STScI-01GS80QTFKXCEJEBGKV9SBEDJP.png',
          state: 'COMPLETED',
          percent: 100
        }, {
          filename: 'STScI-01GWQDPJTF1MY8ZGN4WBMWMACJ.png',
          downloadId: 'shortName_version-1-20230514_012999',
          url: 'https://stsci-opo.org/STScI-01GWQDPJTF1MY8ZGN4WBMWMACJ.png',
          state: 'COMPLETED',
          percent: 100
        }]),
      getDownloadFilesProgressByDownloadId: jest.fn()
        .mockResolvedValueOnce({
          percentSum: 700,
          totalFiles: 7,
          finishedFiles: 7
        }),
      updateDownloadById: jest.fn()
    }
    const webContents = {
      send: jest.fn()
    }

    await reportProgress({ database, webContents })

    expect(database.getAllDownloads).toHaveBeenCalledTimes(1)

    expect(database.getDownloadFilesProgressByDownloadId).toHaveBeenCalledTimes(1)
    expect(database.getDownloadFilesProgressByDownloadId).toHaveBeenCalledWith('shortName_version-1-20230514_012999')

    expect(webContents.send).toHaveBeenCalledTimes(1)
    expect(webContents.send).toHaveBeenCalledWith('reportProgress', {
      progress: [{
        downloadId: 'shortName_version-1-20230514_012999',
        downloadName: 'shortName_version-1-20230514_012999',
        errorInfo: [],
        loadingMoreFiles: false,
        numErrors: 0,
        progress: {
          finishedFiles: 7,
          percent: 100,
          totalFiles: 7,
          totalTime: 2045
        },
        state: 'COMPLETED'
      }]
    })

    expect(database.updateDownloadById).toHaveBeenCalledTimes(1)
    expect(database.updateDownloadById).toHaveBeenCalledWith('shortName_version-1-20230514_012999', { state: 'COMPLETED' })
  })

  test('updates state if a file download is in a paused state', async () => {
    const database = {
      getAllDownloads: jest.fn()
        .mockResolvedValue([{
          id: 'shortName_version-1-20230514_012999',
          downloadLocation: '/mock/location/shortName_version-1-20230514_012999',
          loadingMoreFiles: 0,
          timeStart: 1684027555382,
          state: 'PAUSED',
          errorInfo: [],
          numErrors: 0
        }]),
      getFileStateCounts: jest.fn()
        .mockResolvedValueOnce({
          active: 0,
          completed: 2,
          error: 0,
          paused: 2
        }),
      getFilesWhere: jest.fn()
        .mockResolvedValueOnce([{
          filename: 'STScI-01GHBZC0XR0DCJFZY0QXEH215V.png',
          downloadId: 'shortName_version-1-20230514_012999',
          url: 'https://stsci-opo.org/STScI-01GHBZC0XR0DCJFZY0QXEH215V.png',
          state: 'COMPLETED',
          percent: 100
        }, {
          filename: 'STScI-01GGWD12YEES5K5163RJFYQT20.png',
          downloadId: 'shortName_version-1-20230514_012999',
          url: 'https://stsci-opo.org/STScI-01GGWD12YEES5K5163RJFYQT20.png',
          state: 'COMPLETED',
          percent: 100
        }, {
          filename: 'STScI-01GGF8H15VZ09MET9HFBRQX4S3.png',
          downloadId: 'shortName_version-1-20230514_012999',
          url: 'https://stsci-opo.org/STScI-01GGF8H15VZ09MET9HFBRQX4S3.png',
          state: 'PAUSED',
          percent: 28
        }, {
          filename: 'STScI-01GA76Q01D09HFEV174SVMQDMV.png',
          downloadId: 'shortName_version-1-20230514_012999',
          url: 'https://stsci-opo.org/STScI-01GA76Q01D09HFEV174SVMQDMV.png',
          state: 'PAUSED',
          percent: 37
        }, {
          filename: 'STScI-01G9G4J23CDPVNGCYDJRZTTJQN.png',
          downloadId: 'shortName_version-1-20230514_012999',
          url: 'https://stsci-opo.org/STScI-01G9G4J23CDPVNGCYDJRZTTJQN.png',
          state: 'PENDING',
          percent: 0
        }, {
          filename: 'STScI-01GS80QTFKXCEJEBGKV9SBEDJP.png',
          downloadId: 'shortName_version-1-20230514_012999',
          url: 'https://stsci-opo.org/STScI-01GS80QTFKXCEJEBGKV9SBEDJP.png',
          state: 'PENDING',
          percent: 0
        }, {
          filename: 'STScI-01GWQDPJTF1MY8ZGN4WBMWMACJ.png',
          downloadId: 'shortName_version-1-20230514_012999',
          url: 'https://stsci-opo.org/STScI-01GWQDPJTF1MY8ZGN4WBMWMACJ.png',
          state: 'PENDING',
          percent: 0
        }]),
      getDownloadFilesProgressByDownloadId: jest.fn()
        .mockResolvedValueOnce({
          percentSum: 265,
          totalFiles: 7,
          finishedFiles: 2
        }),
      updateDownloadById: jest.fn()
    }
    const webContents = {
      send: jest.fn()
    }

    await reportProgress({ database, webContents })

    expect(database.getAllDownloads).toHaveBeenCalledTimes(1)

    expect(database.getDownloadFilesProgressByDownloadId).toHaveBeenCalledTimes(1)
    expect(database.getDownloadFilesProgressByDownloadId).toHaveBeenCalledWith('shortName_version-1-20230514_012999')

    expect(webContents.send).toHaveBeenCalledTimes(1)
    expect(webContents.send).toHaveBeenCalledWith('reportProgress', {
      progress: [{
        downloadId: 'shortName_version-1-20230514_012999',
        downloadName: 'shortName_version-1-20230514_012999',
        errorInfo: [],
        loadingMoreFiles: false,
        numErrors: 0,
        progress: {
          finishedFiles: 2,
          percent: 37.9,
          totalFiles: 7,
          totalTime: 2045
        },
        state: 'PAUSED'
      }]
    })

    expect(database.updateDownloadById).toHaveBeenCalledTimes(1)
    expect(database.updateDownloadById).toHaveBeenCalledWith('shortName_version-1-20230514_012999', { state: 'PAUSED' })
  })
})
