const MockDate = require('mockdate')

const { beginDownload } = require('../beginDownload')

beforeEach(() => {
  MockDate.set('2023-05-01')
})

describe('beginDownload', () => {
  test('updates the store with the new information', () => {
    const info = {
      downloadId: 'mock-id',
      downloadLocation: '/mock/location',
      makeDefaultDownloadLocation: false
    }
    const store = {
      set: jest.fn(),
      get: jest.fn().mockReturnValue({
        mock: 'value'
      })
    }

    beginDownload({ info, store })

    expect(store.get).toHaveBeenCalledTimes(1)
    expect(store.set).toHaveBeenCalledTimes(2)
    expect(store.set).toHaveBeenCalledWith('preferences', {
      defaultDownloadLocation: undefined,
      lastDownloadLocation: '/mock/location',
      mock: 'value'
    })
    expect(store.set).toHaveBeenCalledWith('downloads.mock-id', {
      downloadLocation: '/mock/location/mock-id',
      timeStart: 1682899200000
    })
  })

  test('updates the store with defaultDownloadLocation', () => {
    const info = {
      downloadId: 'mock-id',
      downloadLocation: '/mock/location',
      makeDefaultDownloadLocation: true
    }
    const store = {
      set: jest.fn(),
      get: jest.fn().mockReturnValue({
        mock: 'value'
      })
    }

    beginDownload({ info, store })

    expect(store.get).toHaveBeenCalledTimes(1)
    expect(store.set).toHaveBeenCalledTimes(2)
    expect(store.set).toHaveBeenCalledWith('preferences', {
      defaultDownloadLocation: '/mock/location',
      lastDownloadLocation: '/mock/location',
      mock: 'value'
    })
    expect(store.set).toHaveBeenCalledWith('downloads.mock-id', {
      downloadLocation: '/mock/location/mock-id',
      timeStart: 1682899200000
    })
  })
})
