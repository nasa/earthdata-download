// @ts-nocheck

import MockDate from 'mockdate'

import startPendingDownloads from '../startPendingDownloads'

import fetchLinks from '../fetchLinks'

import downloadStates from '../../../app/constants/downloadStates'

jest.mock('../fetchLinks', () => ({
  __esModule: true,
  default: jest.fn(() => { })
}))

beforeEach(() => {
  MockDate.set('2023-05-13T22:00:00')
})

describe('startPendingDownloads', () => {
  test('calls fetchLinks for all pending downloads', async () => {
    const appWindow = {}
    const database = {
      getDownloadsWhere: jest.fn().mockResolvedValue([{
        id: 'mock-download-id-1',
        state: downloadStates.pending,
        getLinksToken: 'mock-token',
        getLinksUrl: 'mock-url'
      }])
    }

    await startPendingDownloads({
      appWindow,
      database
    })

    expect(database.getDownloadsWhere).toHaveBeenCalledTimes(1)
    expect(database.getDownloadsWhere).toHaveBeenCalledWith({ state: downloadStates.pending })

    expect(fetchLinks).toHaveBeenCalledTimes(1)
    expect(fetchLinks).toHaveBeenCalledWith(expect.objectContaining({
      downloadId: 'mock-download-id-1',
      getLinksToken: 'mock-token',
      getLinksUrl: 'mock-url'
    }))
  })
})
