import MockDate from 'mockdate'

import cookiesChanged from '../cookiesChanged'
import startNextDownload from '../willDownloadEvents/startNextDownload'

jest.mock('../willDownloadEvents/startNextDownload', () => ({
  __esModule: true,
  default: jest.fn(() => {})
}))

beforeEach(() => {
  MockDate.set('2023-05-01')

  jest.clearAllMocks()
})

describe('cookiesChanged', () => {
  test('closes authWindow and calls startNextDownload when the auth cookie is added', async () => {
    const authWindow = {
      close: jest.fn()
    }
    const cookie = {
      name: 'asf-urs',
      domain: 'example.com'
    }
    const removed = false
    const database = {
      getFileWaitingForAuthWhereUrlLike: jest.fn().mockResolvedValue({
        downloadId: 'mock-download-id',
        id: 123
      }),
      updateDownloadById: jest.fn()
    }

    await cookiesChanged({
      currentDownloadItems: {},
      authWindow,
      database,
      downloadIdContext: {},
      cookie,
      removed,
      webContents: {}
    })

    expect(database.getFileWaitingForAuthWhereUrlLike).toHaveBeenCalledTimes(1)
    expect(database.getFileWaitingForAuthWhereUrlLike).toHaveBeenCalledWith('example.com')

    expect(database.updateDownloadById).toHaveBeenCalledTimes(1)
    expect(database.updateDownloadById).toHaveBeenCalledWith(
      'mock-download-id',
      {
        state: 'ACTIVE',
        timeStart: 1682899200000
      }
    )

    expect(authWindow.close).toHaveBeenCalledTimes(1)

    expect(startNextDownload).toHaveBeenCalledTimes(1)
    expect(startNextDownload).toHaveBeenCalledWith({
      currentDownloadItems: {},
      database,
      downloadIdContext: {},
      fileId: 123,
      webContents: {}
    })
  })

  test('does not close authWindow and call startNextDownload when the auth cookie is removed', async () => {
    const authWindow = {
      close: jest.fn()
    }
    const cookie = {
      name: 'asf-urs',
      domain: 'example.com'
    }
    const removed = true
    const database = {
      getFileWaitingForAuthWhereUrlLike: jest.fn(),
      updateDownloadById: jest.fn()
    }

    await cookiesChanged({
      currentDownloadItems: {},
      authWindow,
      database,
      downloadIdContext: {},
      cookie,
      removed,
      webContents: {}
    })

    expect(database.getFileWaitingForAuthWhereUrlLike).toHaveBeenCalledTimes(0)
    expect(database.updateDownloadById).toHaveBeenCalledTimes(0)
    expect(authWindow.close).toHaveBeenCalledTimes(0)
    expect(startNextDownload).toHaveBeenCalledTimes(0)
  })

  test('does not close authWindow and call startNextDownload when the cookie is not the correct name', async () => {
    const authWindow = {
      close: jest.fn()
    }
    const cookie = {
      name: 'wrong-cookie',
      domain: 'example.com'
    }
    const removed = false
    const database = {
      getFileWaitingForAuthWhereUrlLike: jest.fn(),
      updateDownloadById: jest.fn()
    }

    await cookiesChanged({
      currentDownloadItems: {},
      authWindow,
      database,
      downloadIdContext: {},
      cookie,
      removed,
      webContents: {}
    })

    expect(database.getFileWaitingForAuthWhereUrlLike).toHaveBeenCalledTimes(0)
    expect(database.updateDownloadById).toHaveBeenCalledTimes(0)
    expect(authWindow.close).toHaveBeenCalledTimes(0)
    expect(startNextDownload).toHaveBeenCalledTimes(0)
  })
})
