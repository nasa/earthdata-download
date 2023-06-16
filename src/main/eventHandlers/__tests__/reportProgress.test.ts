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
          state: 'PENDING'
        }, {
          id: 'shortName_version-1-20230514_012999',
          downloadLocation: '/mock/location/shortName_version-1-20230514_012999',
          loadingMoreFiles: 0,
          timeStart: 1684027555379,
          state: 'ACTIVE'
        }, {
          id: 'shortName_version-1-20230514_012554',
          downloadLocation: '/mock/location/shortName_version-1-20230514_012554',
          loadingMoreFiles: 0,
          timeStart: 1684027555382,
          state: 'ACTIVE'
        }]),
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
          percent: 39
        }, {
          id: 'STScI-01GA6KKWG229B16K4Q38CH3BXS.png',
          downloadId: 'shortName_version-1-20230514_012554',
          url: 'https://stsci-opo.org/STScI-01GA6KKWG229B16K4Q38CH3BXS.png',
          state: 'ACTIVE',
          percent: 11
        }, {
          id: 'STScI-01G8GZQ3ZFJRD8YF8YZWMAXCE3.png',
          downloadId: 'shortName_version-1-20230514_012554',
          url: 'https://stsci-opo.org/STScI-01G8GZQ3ZFJRD8YF8YZWMAXCE3.png',
          state: 'ACTIVE',
          percent: 17
        }, {
          id: 'STScI-01G8H49RQ0E48YDM8WKW9PP5XS.png',
          downloadId: 'shortName_version-1-20230514_012554',
          url: 'https://stsci-opo.org/STScI-01G8H49RQ0E48YDM8WKW9PP5XS.png',
          state: 'ACTIVE',
          percent: 10
        }, {
          id: 'STScI-01GS80QTFKXCEJEBGKV9SBEDJP.png',
          downloadId: 'shortName_version-1-20230514_012554',
          url: 'https://stsci-opo.org/STScI-01GS80QTFKXCEJEBGKV9SBEDJP.png',
          state: 'COMPLETED',
          percent: 100
        }, {
          id: 'STScI-01GQQF9WVPFVMCVHRZY54N2TAR.png',
          downloadId: 'shortName_version-1-20230514_012554',
          url: 'https://stsci-opo.org/STScI-01GQQF9WVPFVMCVHRZY54N2TAR.png',
          state: 'ACTIVE',
          percent: 40
        }, {
          id: 'STScI-01GK2KMYS6HADS6ND8NRHG53RP.png',
          downloadId: 'shortName_version-1-20230514_012554',
          url: 'https://stsci-opo.org/STScI-01GK2KMYS6HADS6ND8NRHG53RP.png',
          state: 'PENDING',
          percent: 0
        }])
    }
    const webContents = {
      send: jest.fn()
    }

    await reportProgress({ database, webContents })

    // TODO
    expect(database.getAllDownloads).toHaveBeenCalledTimes(1)

    expect(database.getFilesWhere).toHaveBeenCalledTimes(3)
    expect(database.getFilesWhere).toHaveBeenCalledWith({ downloadId: 'shortName_version-1-20230520_012000' })
    expect(database.getFilesWhere).toHaveBeenCalledWith({ downloadId: 'shortName_version-1-20230514_012999' })
    expect(database.getFilesWhere).toHaveBeenCalledWith({ downloadId: 'shortName_version-1-20230514_012554' })

    expect(webContents.send).toHaveBeenCalledTimes(1)
    expect(webContents.send).toHaveBeenCalledWith('reportProgress', {
      progress: [{
        downloadId: 'shortName_version-1-20230520_012000',
        downloadName: 'shortName_version-1-20230520_012000',
        loadingMoreFiles: true,
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
        loadingMoreFiles: false,
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
        loadingMoreFiles: false,
        progress: {
          finishedFiles: 2,
          percent: 25,
          totalFiles: 8,
          totalTime: 2045
        },
        state: 'ACTIVE'
      }]
    })
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
    expect(webContents.send).toHaveBeenCalledWith('reportProgress', { progress: [] })
  })
})
