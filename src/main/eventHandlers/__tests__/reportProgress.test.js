const MockDate = require('mockdate')

const reportProgress = require('../reportProgress')

beforeEach(() => {
  MockDate.set('2023-05-13T22:00:00')
})

describe('reportProgress', () => {
  test('reports progress of collection downloads', () => {
    const store = {
      get: jest.fn().mockReturnValue({
        'shortName_version-1-20230514_012554': {
          downloadLocation: '/mock/location/shortName_version-1-20230514_012554',
          timeStart: 1684027555379,
          files: {
            'STScI-01GTYAME8Q4353E2WQQH2965S5.png': {
              url: 'https://stsci-opo.org/STScI-01GTYAME8Q4353E2WQQH2965S5.png',
              state: 'COMPLETED',
              percent: 100
            },
            'STScI-01G8H1K2BCNATEZSKVRN9Z69SR.png': {
              url: 'https://stsci-opo.org/STScI-01G8H1K2BCNATEZSKVRN9Z69SR.png',
              state: 'ACTIVE',
              percent: 39
            },
            'STScI-01GA6KKWG229B16K4Q38CH3BXS.png': {
              url: 'https://stsci-opo.org/STScI-01GA6KKWG229B16K4Q38CH3BXS.png',
              state: 'ACTIVE',
              percent: 11
            },
            'STScI-01G8GZQ3ZFJRD8YF8YZWMAXCE3.png': {
              url: 'https://stsci-opo.org/STScI-01G8GZQ3ZFJRD8YF8YZWMAXCE3.png',
              state: 'ACTIVE',
              percent: 17
            },
            'STScI-01G8H49RQ0E48YDM8WKW9PP5XS.png': {
              url: 'https://stsci-opo.org/STScI-01G8H49RQ0E48YDM8WKW9PP5XS.png',
              state: 'ACTIVE',
              percent: 10
            },
            'STScI-01GS80QTFKXCEJEBGKV9SBEDJP.png': {
              url: 'https://stsci-opo.org/STScI-01GS80QTFKXCEJEBGKV9SBEDJP.png',
              state: 'COMPLETED',
              percent: 100
            },
            'STScI-01GQQF9WVPFVMCVHRZY54N2TAR.png': {
              url: 'https://stsci-opo.org/STScI-01GQQF9WVPFVMCVHRZY54N2TAR.png',
              state: 'ACTIVE',
              percent: 40
            },
            'STScI-01GK2KMYS6HADS6ND8NRHG53RP.png': {
              url: 'https://stsci-opo.org/STScI-01GK2KMYS6HADS6ND8NRHG53RP.png',
              state: 'PENDING',
              percent: 0
            }
          },
          state: 'ACTIVE'
        },
        'shortName_version-2-20230514_012554': {
          downloadLocation: '/mock/location/shortName_version-2-20230514_012554',
          timeStart: 1684027555382,
          files: {
            'STScI-01GHBZC0XR0DCJFZY0QXEH215V.png': {
              url: 'https://stsci-opo.org/STScI-01GHBZC0XR0DCJFZY0QXEH215V.png',
              state: 'PENDING',
              percent: 0
            },
            'STScI-01GGWD12YEES5K5163RJFYQT20.png': {
              url: 'https://stsci-opo.org/STScI-01GGWD12YEES5K5163RJFYQT20.png',
              state: 'PENDING',
              percent: 0
            },
            'STScI-01GGF8H15VZ09MET9HFBRQX4S3.png': {
              url: 'https://stsci-opo.org/STScI-01GGF8H15VZ09MET9HFBRQX4S3.png',
              state: 'PENDING',
              percent: 0
            },
            'STScI-01GA76Q01D09HFEV174SVMQDMV.png': {
              url: 'https://stsci-opo.org/STScI-01GA76Q01D09HFEV174SVMQDMV.png',
              state: 'PENDING',
              percent: 0
            },
            'STScI-01G9G4J23CDPVNGCYDJRZTTJQN.png': {
              url: 'https://stsci-opo.org/STScI-01G9G4J23CDPVNGCYDJRZTTJQN.png',
              state: 'PENDING',
              percent: 0
            },
            'STScI-01GS80QTFKXCEJEBGKV9SBEDJP.png': {
              url: 'https://stsci-opo.org/STScI-01GS80QTFKXCEJEBGKV9SBEDJP.png',
              state: 'PENDING',
              percent: 0
            },
            'STScI-01GWQDPJTF1MY8ZGN4WBMWMACJ.png': {
              url: 'https://stsci-opo.org/STScI-01GWQDPJTF1MY8ZGN4WBMWMACJ.png',
              state: 'PENDING',
              percent: 0
            }
          },
          state: 'ACTIVE'
        }
      })
    }
    const webContents = {
      send: jest.fn()
    }

    const result = reportProgress({ store, webContents })

    expect(result).toEqual(true)

    expect(webContents.send).toHaveBeenCalledTimes(1)
    expect(webContents.send).toHaveBeenCalledWith('reportProgress', {
      progress: [{
        downloadId: 'shortName_version-2-20230514_012554',
        downloadName: 'shortName_version-2-20230514_012554',
        progress: {
          finishedFiles: 0, percent: 0, totalFiles: 7, totalTime: 2045
        },
        state: 'ACTIVE'
      }, {
        downloadId: 'shortName_version-1-20230514_012554',
        downloadName: 'shortName_version-1-20230514_012554',
        progress: {
          finishedFiles: 2, percent: 25, totalFiles: 8, totalTime: 2045
        },
        state: 'ACTIVE'
      }]
    })
  })

  test('does not report progress if no downloads exist', () => {
    const store = {
      get: jest.fn().mockReturnValue(undefined)
    }
    const webContents = {
      send: jest.fn()
    }

    const result = reportProgress({ store, webContents })

    expect(result).toEqual(false)

    expect(webContents.send).toHaveBeenCalledTimes(0)
  })
})
