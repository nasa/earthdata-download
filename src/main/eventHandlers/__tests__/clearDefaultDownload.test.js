const { app } = require('electron')
const MockDate = require('mockdate')

const { clearDefaultDownload } = require('../clearDefaultDownload')

beforeEach(() => {
  MockDate.set('2023-05-01')
  app.getPath = jest.fn().mockReturnValue('/Downloads')
})

describe('clearDefaultDownload', () => {
  test('clears the default download location from preferences', () => {
    const downloadId = 'mock-download-id'
    const store = {
      set: jest.fn(),
      get: jest.fn().mockReturnValue({
        defaultDownloadLocation: '/mock/default/location',
        lastDownloadLocation: '/mock/last/location'
      })
    }
    const window = {
      webContents: {
        send: jest.fn()
      }
    }

    clearDefaultDownload({
      downloadId,
      store,
      window
    })

    expect(store.get).toHaveBeenCalledTimes(1)
    expect(store.set).toHaveBeenCalledTimes(1)
    expect(store.set).toHaveBeenCalledWith('preferences', {
      defaultDownloadLocation: undefined,
      lastDownloadLocation: '/mock/last/location'
    })
    expect(window.webContents.send).toHaveBeenCalledTimes(1)
    expect(window.webContents.send).toHaveBeenCalledWith('initializeDownload', {
      downloadId: 'mock-download-id',
      downloadLocation: '/mock/last/location',
      shouldUseDefaultLocation: false
    })
  })
})
