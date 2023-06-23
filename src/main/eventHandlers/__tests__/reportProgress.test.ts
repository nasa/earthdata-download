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
        })
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
          percent: 39.6,
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
