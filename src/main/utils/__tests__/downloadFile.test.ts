// @ts-nocheck

import { session } from 'electron'
import MockDate from 'mockdate'

import downloadFile from '../downloadFile'

import downloadStates from '../../../app/constants/downloadStates'

jest.mock(
  'electron',
  () => {
    const mockSession = {
      defaultSession: {
        clearStorageData: jest.fn()
      }
    }

    return {
      session: mockSession
    }
  },
  { virtual: true }
)

beforeEach(() => {
  MockDate.set('2023-05-13T22:00:00')
})

describe('downloadFile', () => {
  test('updates downloadIdContext and calls downloadURL', async () => {
    const downloadId = 'mock-download-id'
    const downloadIdContext = {}
    const database = {
      getToken: jest.fn().mockResolvedValue({ token: null }),
      getDownloadById: jest.fn().mockResolvedValue({ downloadLocation: '/mock/location' }),
      updateFileById: jest.fn()
    }
    const webContents = {
      downloadURL: jest.fn()
    }
    const file = {
      downloadId,
      id: 123,
      url: 'http://example.com/mock-file.png'
    }

    await downloadFile({
      database,
      downloadIdContext,
      file,
      webContents
    })

    expect(database.getDownloadById).toHaveBeenCalledTimes(1)
    expect(database.getDownloadById).toHaveBeenCalledWith(downloadId)

    expect(database.updateFileById).toHaveBeenCalledTimes(1)
    expect(database.updateFileById).toHaveBeenCalledWith(123, { state: downloadStates.starting })

    expect(session.defaultSession.clearStorageData).toHaveBeenCalledTimes(1)

    expect(webContents.downloadURL).toHaveBeenCalledTimes(1)
    expect(webContents.downloadURL).toHaveBeenCalledWith(
      'http://example.com/mock-file.png',
      { headers: {} }
    )
  })

  test('updates downloadIdContext and calls downloadURL with a token', async () => {
    const downloadId = 'mock-download-id'
    const downloadIdContext = {}
    const database = {
      getToken: jest.fn().mockResolvedValue({ token: 'mock-token' }),
      getDownloadById: jest.fn().mockResolvedValue({ downloadLocation: '/mock/location' }),
      updateFileById: jest.fn()
    }
    const webContents = {
      downloadURL: jest.fn()
    }
    const file = {
      downloadId,
      id: 123,
      url: 'http://example.com/mock-file.png'
    }

    await downloadFile({
      database,
      downloadIdContext,
      file,
      webContents
    })

    expect(database.getDownloadById).toHaveBeenCalledTimes(1)
    expect(database.getDownloadById).toHaveBeenCalledWith(downloadId)

    expect(database.updateFileById).toHaveBeenCalledTimes(1)
    expect(database.updateFileById).toHaveBeenCalledWith(123, { state: downloadStates.starting })

    expect(session.defaultSession.clearStorageData).toHaveBeenCalledTimes(1)

    expect(webContents.downloadURL).toHaveBeenCalledTimes(1)
    expect(webContents.downloadURL).toHaveBeenCalledWith(
      'http://example.com/mock-file.png',
      {
        headers: {
          Authorization: 'Bearer mock-token'
        }
      }
    )
  })
})
