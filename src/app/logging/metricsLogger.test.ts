// eslint-disable-next-line import/no-extraneous-dependencies
import axios from 'axios'
import metricsLogger from './metricsLogger'

jest.mock('axios')

describe('metricsLogger', () => {
  it('should log a successful response on a CollectionDownload payload', async () => {
    const event = {
      eventType: 'DownloadComplete',
      data: {
        fileCount: 100,
        totalFileSize: 2048,
        successfulDownloads: 96,
        failedDownloads: 4
      }
    };

    (axios.post as any).mockResolvedValue({
      eventType: 'DownloadComplete',
      data: {
        fileCount: 100,
        totalFileSize: 2048,
        successfulDownloads: 96,
        failedDownloads: 4
      }
    })

    const log = jest.spyOn(console, 'log').mockImplementation(() => {})
    const error = jest.spyOn(console, 'error').mockImplementation(() => {})

    await metricsLogger(event)

    expect(axios.post).toHaveBeenCalledWith('http://localhost:3001/dev/edd_logger', {
      params: {
        eventType: 'DownloadComplete',
        data: {
          fileCount: 100,
          totalFileSize: 2048,
          successfulDownloads: 96,
          failedDownloads: 4
        }
      }
    })

    expect(log).toHaveBeenCalledWith({
      eventType: 'DownloadComplete',
      data: {
        fileCount: 100,
        totalFileSize: 2048,
        successfulDownloads: 96,
        failedDownloads: 4
      }
    })

    expect(error).not.toHaveBeenCalled()
  })

  it('should log an error response', async () => {
    const event = {
      eventType: 'DownloadComplete',
      data: {
        fileCount: 100,
        totalFileSize: 2048,
        successfulDownloads: 96,
        failedDownloads: 4
      }
    };

    (axios.post as any).mockRejectedValue('Error')

    const error = jest.spyOn(console, 'error').mockImplementation(() => {})

    await metricsLogger(event)

    expect(axios.post).toHaveBeenCalledWith('http://localhost:3001/dev/edd_logger', {
      params: {
        eventType: 'DownloadComplete',
        data: {
          fileCount: 100,
          totalFileSize: 2048,
          successfulDownloads: 96,
          failedDownloads: 4
        }
      }
    })

    expect(error).toHaveBeenCalledWith('Error')
  })

  it('should log a successful response on a DownloadPause payload', async () => {
    const event = {
      eventType: 'DownloadPause',
      data: {
        downloadId: '1010_Test',
        percent: 17.8,
        finishedFiles: 2,
        totalFiles: 7
      }
    };

    (axios.post as any).mockResolvedValue({
      eventType: 'DownloadPause',
      data: {
        downloadId: '1010_Test',
        percent: 17.8,
        finishedFiles: 2,
        totalFiles: 7
      }
    })

    const log = jest.spyOn(console, 'log').mockImplementation(() => {})
    const error = jest.spyOn(console, 'error').mockImplementation(() => {})

    await metricsLogger(event)

    expect(axios.post).toHaveBeenCalledWith('http://localhost:3001/dev/edd_logger', {
      params: {
        eventType: 'DownloadPause',
        data: {
          downloadId: '1010_Test',
          percent: 17.8,
          finishedFiles: 2,
          totalFiles: 7
        }
      }
    })

    expect(log).toHaveBeenCalledWith({
      eventType: 'DownloadPause',
      data: {
        downloadId: '1010_Test',
        percent: 17.8,
        finishedFiles: 2,
        totalFiles: 7
      }
    })

    expect(error).not.toHaveBeenCalled()
  })
})
