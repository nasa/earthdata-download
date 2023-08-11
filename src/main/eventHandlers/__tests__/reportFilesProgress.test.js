import MockDate from 'mockdate'

import reportFilesProgress from '../reportFilesProgress'

import downloadStates from '../../../app/constants/downloadStates'

beforeEach(() => {
  // Retrieved time from https://www.utctime.net/
  MockDate.set('2023-07-19T21:53:05Z')
})

describe.skip('reportFilesProgress', () => {
  describe('when `receivedBytes` is reported because the file is being actively downloaded', () => {
    test('the progress of a fileDownload is reported', async () => {
      const mockDownloadId = 'mock-download-id'
      const database = {
        getFilesWhere: jest.fn()
          .mockResolvedValue(
            [
              {
                id: 1294,
                downloadId: '7010 collection_1.5-20230718_162025',
                filename: 'file-mock-1.png',
                state: downloadStates.active,
                url: 'http://example.com/mock-filename-1.png',
                percent: 58,
                createdAt: 1689803243674,
                timeStart: 1689803244698,
                timeEnd: null,
                errors: null,
                receivedBytes: 17563648,
                totalBytes: 29899960
              }]
          ),
        getDownloadData: jest.fn()
          .mockResolvedValueOnce({
            downloadLocation: '/mock/location',
            id: '7010 collection_1.5-20230718_162025',
            percentSum: null,
            totalFiles: 0,
            finishedFiles: 0,
            erroredFiles: 0
          })
      }
      const webContents = {
        send: jest.fn()
      }

      await reportFilesProgress({
        database,
        webContents,
        downloadId: mockDownloadId
      })

      expect(database.getFilesWhere).toHaveBeenCalledTimes(1)
      expect(database.getFilesWhere).toHaveBeenCalledWith({ downloadId: mockDownloadId })

      expect(webContents.send).toHaveBeenCalledTimes(1)
      expect(webContents.send).toHaveBeenCalledWith('reportFilesProgress', {
        filesReport: [
          {
            id: 1294,
            downloadId: '7010 collection_1.5-20230718_162025',
            filename: 'file-mock-1.png',
            state: 'ACTIVE',
            url: 'http://example.com/mock-filename-1.png',
            percent: 58,
            createdAt: 1689803243674,
            timeStart: 1689803244698,
            remainingTime: 240,
            timeEnd: null,
            errors: null,
            receivedBytes: 17563648,
            totalBytes: 29899960
          }
        ],
        downloadReport: {
          downloadLocation: '/mock/location',
          erroredFiles: 0,
          finishedFiles: 0,
          id: '7010 collection_1.5-20230718_162025',
          percentSum: null,
          totalFiles: 0,
          totalTimeRemaining: 240,
          percent: 0,
          totalTime: 1
        }
      })
    })
  })

  describe('when 0 `receivedBytes` is reported for a file because it is initializing', () => {
    test('remainingTime will be null', async () => {
      const mockDownloadId = 'mock-download-id'
      const database = {
        getFilesWhere: jest.fn()
          .mockResolvedValue(
            [
              {
                id: 1294,
                downloadId: '7010 collection_1.5-20230718_162025',
                filename: 'file-mock-1.png',
                state: downloadStates.active,
                url: 'http://example.com/mock-filename-1.png',
                percent: 58,
                createdAt: 1689803243674,
                timeStart: 1689803244698,
                timeEnd: null,
                errors: null,
                receivedBytes: 0,
                totalBytes: 29899960
              }]
          ),
        getDownloadFilesProgressByDownloadId: jest.fn()
          .mockResolvedValueOnce({
            percentSum: null,
            totalFiles: 0,
            finishedFiles: 0,
            erroredFiles: 0
          }),
        getDownloadById: jest.fn().mockResolvedValue({
          downloadLocation: '/mock/location',
          id: '7010 collection_1.5-20230718_162025'
        })
      }
      const webContents = {
        send: jest.fn()
      }

      await reportFilesProgress({
        database,
        webContents,
        downloadId: mockDownloadId
      })

      expect(database.getFilesWhere).toHaveBeenCalledTimes(1)
      expect(database.getFilesWhere).toHaveBeenCalledWith({ downloadId: mockDownloadId })

      expect(webContents.send).toHaveBeenCalledTimes(1)
      expect(webContents.send).toHaveBeenCalledWith('reportFilesProgress', {
        fileDownloadsProgressReport: [
          {
            id: 1294,
            downloadId: '7010 collection_1.5-20230718_162025',
            filename: 'file-mock-1.png',
            state: downloadStates.active,
            url: 'http://example.com/mock-filename-1.png',
            percent: 58,
            createdAt: 1689803243674,
            timeStart: 1689803244698,
            remainingTime: null,
            timeEnd: null,
            errors: null,
            receivedBytes: 0,
            totalBytes: 29899960
          }
        ],
        downloadReport: {
          downloadLocation: '/mock/location',
          erroredFiles: 0,
          finishedFiles: 0,
          id: '7010 collection_1.5-20230718_162025',
          percentSum: null,
          totalFiles: 0
        }
      })
    })
  })
})
