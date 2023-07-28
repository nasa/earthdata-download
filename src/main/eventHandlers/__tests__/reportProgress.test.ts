// @ts-nocheck

import MockDate from 'mockdate'

import reportProgress from '../reportProgress'

import downloadStates from '../../../app/constants/downloadStates'

beforeEach(() => {
  MockDate.set('2023-05-13T22:00:00')
})

describe('reportProgress', () => {
  test('reports progress of collection downloads', async () => {
    const database = {
      getAllDownloads: jest.fn()
        .mockResolvedValue([{
          id: 'download-id-1',
          downloadLocation: '/mock/location/download-id-1',
          loadingMoreFiles: 1,
          timeStart: 1684027555379,
          state: downloadStates.pending
        }, {
          id: 'download-id-2',
          downloadLocation: '/mock/location/download-id-2',
          loadingMoreFiles: 0,
          timeStart: 1684027555379,
          state: 'ACTIVE'
        }, {
          id: 'download-id-3',
          downloadLocation: '/mock/location/download-id-3',
          loadingMoreFiles: 0,
          timeStart: 1684027555382,
          state: 'ACTIVE'
        }]),
      getDownloadFilesProgressByDownloadId: jest.fn()
        .mockResolvedValueOnce({
          percentSum: null,
          totalFiles: 0,
          finishedFiles: 0,
          erroredFiles: 0
        })
        .mockResolvedValueOnce({
          percentSum: 0,
          totalFiles: 7,
          finishedFiles: 0,
          erroredFiles: 0
        })
        .mockResolvedValueOnce({
          percentSum: 317,
          totalFiles: 8,
          finishedFiles: 2,
          erroredFiles: 0
        }),
      getFilesWhere: jest.fn()
    }
    const webContents = {
      send: jest.fn()
    }

    await reportProgress({
      database,
      webContents
    })

    expect(database.getAllDownloads).toHaveBeenCalledTimes(1)

    expect(database.getDownloadFilesProgressByDownloadId).toHaveBeenCalledTimes(3)
    expect(database.getDownloadFilesProgressByDownloadId).toHaveBeenCalledWith('download-id-1')
    expect(database.getDownloadFilesProgressByDownloadId).toHaveBeenCalledWith('download-id-2')
    expect(database.getDownloadFilesProgressByDownloadId).toHaveBeenCalledWith('download-id-3')

    expect(database.getFilesWhere).toHaveBeenCalledTimes(0)

    expect(webContents.send).toHaveBeenCalledTimes(1)
    expect(webContents.send).toHaveBeenCalledWith('reportProgress', {
      progressReport: [{
        downloadId: 'download-id-1',
        downloadName: 'download-id-1',
        loadingMoreFiles: true,
        progress: {
          finishedFiles: 0,
          percent: 0,
          totalFiles: 0,
          totalTime: 2045
        },
        state: downloadStates.pending
      }, {
        downloadId: 'download-id-2',
        downloadName: 'download-id-2',
        loadingMoreFiles: false,
        progress: {
          finishedFiles: 0,
          percent: 0,
          totalFiles: 7,
          totalTime: 2045
        },
        state: 'ACTIVE'
      }, {
        downloadId: 'download-id-3',
        downloadName: 'download-id-3',
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

    await reportProgress({
      database,
      webContents
    })

    expect(webContents.send).toHaveBeenCalledTimes(1)
    expect(webContents.send).toHaveBeenCalledWith('reportProgress', { progressReport: [] })
  })

  test('reports progress of downloads with errors', async () => {
    const database = {
      getAllDownloads: jest.fn()
        .mockResolvedValue([{
          id: 'download-id-1',
          downloadLocation: '/mock/location/download-id-1',
          loadingMoreFiles: 1,
          timeStart: 1684027555379,
          state: 'ACTIVE'
        }]),
      getDownloadFilesProgressByDownloadId: jest.fn()
        .mockResolvedValueOnce({
          percentSum: null,
          totalFiles: 1,
          finishedFiles: 0,
          erroredFiles: 1
        }),
      getFilesWhere: jest.fn().mockResolvedValue([{
        id: 123,
        filename: 'mock-filename.png',
        state: downloadStates.error
      }])
    }
    const webContents = {
      send: jest.fn()
    }

    await reportProgress({
      database,
      webContents
    })

    expect(database.getAllDownloads).toHaveBeenCalledTimes(1)

    expect(database.getDownloadFilesProgressByDownloadId).toHaveBeenCalledTimes(1)
    expect(database.getDownloadFilesProgressByDownloadId).toHaveBeenCalledWith('download-id-1')

    expect(database.getFilesWhere).toHaveBeenCalledTimes(1)
    expect(database.getFilesWhere).toHaveBeenCalledWith({
      downloadId: 'download-id-1',
      state: downloadStates.error
    })

    expect(webContents.send).toHaveBeenCalledTimes(1)
    expect(webContents.send).toHaveBeenCalledWith('reportProgress', {
      progressReport: [{
        downloadId: 'download-id-1',
        downloadName: 'download-id-1',
        errors: [{
          id: 123,
          filename: 'mock-filename.png',
          state: downloadStates.error
        }],
        loadingMoreFiles: true,
        progress: {
          finishedFiles: 0,
          percent: 0,
          totalFiles: 1,
          totalTime: 2045
        },
        state: downloadStates.active
      }]
    })
  })
})
