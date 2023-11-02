// eslint-disable-next-line import/no-extraneous-dependencies
import axios from 'axios'
import metricsLogger from './metricsLogger'

jest.mock('axios')

describe('metricsLogger', () => {
  it('should log a successful response on a DownloadComplete payload', async () => {
    const event = {
      eventType: 'DownloadComplete',
      data: {
        downloadId: '1010_Test',
        fileCount: 100,
        receivedBytes: 20480,
        totalBytes: 25600,
        filesDwonloaded: 8,
        filesFailed: 2,
        duration: 14.1
      }
    };

    (axios.post as any).mockResolvedValue({
      eventType: 'DownloadComplete',
      data: {
        downloadId: '1010_Test',
        fileCount: 100,
        receivedBytes: 20480,
        totalBytes: 25600,
        filesDwonloaded: 8,
        filesFailed: 2,
        duration: 14.1
      }
    })

    const log = jest.spyOn(console, 'log').mockImplementation(() => {})
    const error = jest.spyOn(console, 'error').mockImplementation(() => {})

    await metricsLogger(event)

    expect(axios.post).toHaveBeenCalledWith('http://localhost:3001/dev/edd_logger', {
      params: {
        eventType: 'DownloadComplete',
        data: {
          downloadId: '1010_Test',
          fileCount: 100,
          receivedBytes: 20480,
          totalBytes: 25600,
          filesDwonloaded: 8,
          filesFailed: 2,
          duration: 14.1
        }
      }
    })

    expect(log).toHaveBeenCalledWith({
      eventType: 'DownloadComplete',
      data: {
        downloadId: '1010_Test',
        fileCount: 100,
        receivedBytes: 20480,
        totalBytes: 25600,
        filesDwonloaded: 8,
        filesFailed: 2,
        duration: 14.1
      }
    })

    expect(error).not.toHaveBeenCalled()
  })

  it('should log a successful response on a DownloadRestart payload', async () => {
    const event = {
      eventType: 'DownloadRestart',
      data: {
        downloadId: '1010_Test',
        finishedFiles: 8,
        totalFiles: 10
      }
    };

    (axios.post as any).mockResolvedValue({
      eventType: 'DownloadRestart',
      data: {
        downloadId: '1010_Test',
        finishedFiles: 8,
        totalFiles: 10
      }
    })

    const log = jest.spyOn(console, 'log').mockImplementation(() => {})
    const error = jest.spyOn(console, 'error').mockImplementation(() => {})

    await metricsLogger(event)

    expect(axios.post).toHaveBeenCalledWith('http://localhost:3001/dev/edd_logger', {
      params: {
        eventType: 'DownloadRestart',
        data: {
          downloadId: '1010_Test',
          finishedFiles: 8,
          totalFiles: 10
        }
      }
    })

    expect(log).toHaveBeenCalledWith({
      eventType: 'DownloadRestart',
      data: {
        downloadId: '1010_Test',
        finishedFiles: 8,
        totalFiles: 10
      }
    })

    expect(error).not.toHaveBeenCalled()
  })

  it('should log an error response', async () => {
    const event = {
      eventType: 'DownloadComplete',
      data: {
        downloadId: '1010_Test',
        fileCount: 100,
        receivedBytes: 20480,
        totalBytes: 25600,
        filesDwonloaded: 8,
        filesFailed: 2,
        duration: 14.1
      }
    };

    (axios.post as any).mockRejectedValue('Error')

    const error = jest.spyOn(console, 'error').mockImplementation(() => {})

    await metricsLogger(event)

    expect(axios.post).toHaveBeenCalledWith('http://localhost:3001/dev/edd_logger', {
      params: {
        eventType: 'DownloadComplete',
        data: {
          downloadId: '1010_Test',
          fileCount: 100,
          receivedBytes: 20480,
          totalBytes: 25600,
          filesDwonloaded: 8,
          filesFailed: 2,
          duration: 14.1
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
        downloadItems: {
          '7072_Test_2019.0-20231102_015502': {
            'STScI-01G8GZQ3ZFJRD8YF8YZWMAXCE3.png': {
              savePath: '/Users/apesall/Downloads/7072_Test_2019.0-20231102_015502/STScI-01G8GZQ3ZFJRD8YF8YZWMAXCE3.png',
              _events: {},
              _eventsCount: 2
            },
            'STScI-01GTYAME8Q4353E2WQQH2965S5.png': {
              savePath: '/Users/apesall/Downloads/7072_Test_2019.0-20231102_015502/STScI-01GTYAME8Q4353E2WQQH2965S5.png',
              _events: {},
              _eventsCount: 2
            }
          }
        }
      }
    };

    (axios.post as any).mockResolvedValue({
      eventType: 'DownloadPause',
      data: {
        downloadId: '1010_Test',
        downloadItems: {
          '7072_Test_2019.0-20231102_015502': {
            'STScI-01G8GZQ3ZFJRD8YF8YZWMAXCE3.png': {
              savePath: '/Users/apesall/Downloads/7072_Test_2019.0-20231102_015502/STScI-01G8GZQ3ZFJRD8YF8YZWMAXCE3.png',
              _events: {},
              _eventsCount: 2
            },
            'STScI-01GTYAME8Q4353E2WQQH2965S5.png': {
              savePath: '/Users/apesall/Downloads/7072_Test_2019.0-20231102_015502/STScI-01GTYAME8Q4353E2WQQH2965S5.png',
              _events: {},
              _eventsCount: 2
            }
          }
        }
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
          downloadItems: {
            '7072_Test_2019.0-20231102_015502': {
              'STScI-01G8GZQ3ZFJRD8YF8YZWMAXCE3.png': {
                savePath: '/Users/apesall/Downloads/7072_Test_2019.0-20231102_015502/STScI-01G8GZQ3ZFJRD8YF8YZWMAXCE3.png',
                _events: {},
                _eventsCount: 2
              },
              'STScI-01GTYAME8Q4353E2WQQH2965S5.png': {
                savePath: '/Users/apesall/Downloads/7072_Test_2019.0-20231102_015502/STScI-01GTYAME8Q4353E2WQQH2965S5.png',
                _events: {},
                _eventsCount: 2
              }
            }
          }
        }
      }
    })

    expect(log).toHaveBeenCalledWith({
      eventType: 'DownloadPause',
      data: {
        downloadId: '1010_Test',
        downloadItems: {
          '7072_Test_2019.0-20231102_015502': {
            'STScI-01G8GZQ3ZFJRD8YF8YZWMAXCE3.png': {
              savePath: '/Users/apesall/Downloads/7072_Test_2019.0-20231102_015502/STScI-01G8GZQ3ZFJRD8YF8YZWMAXCE3.png',
              _events: {},
              _eventsCount: 2
            },
            'STScI-01GTYAME8Q4353E2WQQH2965S5.png': {
              savePath: '/Users/apesall/Downloads/7072_Test_2019.0-20231102_015502/STScI-01GTYAME8Q4353E2WQQH2965S5.png',
              _events: {},
              _eventsCount: 2
            }
          }
        }
      }
    })

    expect(error).not.toHaveBeenCalled()
  })

  it('should log a successful response on a DownloadResume payload', async () => {
    const event = {
      eventType: 'DownloadResume',
      data: {
        downloadId: '1010_Test',
        downloadItems: {
          '7072_Test_2019.0-20231102_015502': {
            'STScI-01G8GZQ3ZFJRD8YF8YZWMAXCE3.png': {
              savePath: '/Users/apesall/Downloads/7072_Test_2019.0-20231102_015502/STScI-01G8GZQ3ZFJRD8YF8YZWMAXCE3.png',
              _events: {},
              _eventsCount: 2
            },
            'STScI-01GTYAME8Q4353E2WQQH2965S5.png': {
              savePath: '/Users/apesall/Downloads/7072_Test_2019.0-20231102_015502/STScI-01GTYAME8Q4353E2WQQH2965S5.png',
              _events: {},
              _eventsCount: 2
            }
          }
        }
      }
    };

    (axios.post as any).mockResolvedValue({
      eventType: 'DownloadResume',
      data: {
        downloadId: '1010_Test',
        downloadItems: {
          '7072_Test_2019.0-20231102_015502': {
            'STScI-01G8GZQ3ZFJRD8YF8YZWMAXCE3.png': {
              savePath: '/Users/apesall/Downloads/7072_Test_2019.0-20231102_015502/STScI-01G8GZQ3ZFJRD8YF8YZWMAXCE3.png',
              _events: {},
              _eventsCount: 2
            },
            'STScI-01GTYAME8Q4353E2WQQH2965S5.png': {
              savePath: '/Users/apesall/Downloads/7072_Test_2019.0-20231102_015502/STScI-01GTYAME8Q4353E2WQQH2965S5.png',
              _events: {},
              _eventsCount: 2
            }
          }
        }
      }
    })

    const log = jest.spyOn(console, 'log').mockImplementation(() => {})
    const error = jest.spyOn(console, 'error').mockImplementation(() => {})

    await metricsLogger(event)

    expect(axios.post).toHaveBeenCalledWith('http://localhost:3001/dev/edd_logger', {
      params: {
        eventType: 'DownloadResume',
        data: {
          downloadId: '1010_Test',
          downloadItems: {
            '7072_Test_2019.0-20231102_015502': {
              'STScI-01G8GZQ3ZFJRD8YF8YZWMAXCE3.png': {
                savePath: '/Users/apesall/Downloads/7072_Test_2019.0-20231102_015502/STScI-01G8GZQ3ZFJRD8YF8YZWMAXCE3.png',
                _events: {},
                _eventsCount: 2
              },
              'STScI-01GTYAME8Q4353E2WQQH2965S5.png': {
                savePath: '/Users/apesall/Downloads/7072_Test_2019.0-20231102_015502/STScI-01GTYAME8Q4353E2WQQH2965S5.png',
                _events: {},
                _eventsCount: 2
              }
            }
          }
        }
      }
    })

    expect(log).toHaveBeenCalledWith({
      eventType: 'DownloadResume',
      data: {
        downloadId: '1010_Test',
        downloadItems: {
          '7072_Test_2019.0-20231102_015502': {
            'STScI-01G8GZQ3ZFJRD8YF8YZWMAXCE3.png': {
              savePath: '/Users/apesall/Downloads/7072_Test_2019.0-20231102_015502/STScI-01G8GZQ3ZFJRD8YF8YZWMAXCE3.png',
              _events: {},
              _eventsCount: 2
            },
            'STScI-01GTYAME8Q4353E2WQQH2965S5.png': {
              savePath: '/Users/apesall/Downloads/7072_Test_2019.0-20231102_015502/STScI-01GTYAME8Q4353E2WQQH2965S5.png',
              _events: {},
              _eventsCount: 2
            }
          }
        }
      }
    })

    expect(error).not.toHaveBeenCalled()
  })
})
