// @ts-nocheck

import MockDate from 'mockdate'

import beginDownload from '../beginDownload'
import CurrentDownloadItems from '../../utils/currentDownloadItems'
import startNextDownload from '../../utils/startNextDownload'

import downloadStates from '../../../app/constants/downloadStates'

jest.mock('../../utils/startNextDownload', () => ({
  __esModule: true,
  default: jest.fn(() => {})
}))

beforeEach(() => {
  MockDate.set('2023-05-01')

  jest.clearAllMocks()
})

describe('beginDownload', () => {
  test('updates the database with the new information', async () => {
    const downloadIdContext = {}
    const info = {
      downloadIds: ['mock-id'],
      downloadLocation: '/mock/location',
      makeDefaultDownloadLocation: false
    }
    const database = {
      setPreferences: jest.fn(),
      getDownloadById: jest.fn().mockResolvedValue({ state: downloadStates.starting }),
      updateDownloadById: jest.fn()
    }
    const webContents = {
      downloadURL: jest.fn()
    }

    await beginDownload({
      downloadIdContext,
      currentDownloadItems: new CurrentDownloadItems(),
      info,
      database,
      webContents
    })

    expect(database.setPreferences).toHaveBeenCalledTimes(1)
    expect(database.setPreferences).toHaveBeenCalledWith({
      defaultDownloadLocation: undefined,
      lastDownloadLocation: '/mock/location'
    })

    expect(database.getDownloadById).toHaveBeenCalledTimes(1)
    expect(database.getDownloadById).toHaveBeenCalledWith('mock-id')

    expect(database.updateDownloadById).toHaveBeenCalledTimes(1)
    expect(database.updateDownloadById).toHaveBeenCalledWith('mock-id', {
      downloadLocation: '/mock/location/mock-id',
      state: downloadStates.active,
      timeStart: 1682899200000
    })

    expect(startNextDownload).toHaveBeenCalledTimes(1)
    expect(startNextDownload).toHaveBeenCalledWith(
      expect.objectContaining({
        downloadId: 'mock-id',
        downloadIdContext: {}
      })
    )
  })

  test('updates the database with defaultDownloadLocation', async () => {
    const downloadIdContext = {}
    const info = {
      downloadIds: ['mock-id'],
      downloadLocation: '/mock/location',
      makeDefaultDownloadLocation: true
    }
    const database = {
      setPreferences: jest.fn(),
      getDownloadById: jest.fn().mockResolvedValue({ state: downloadStates.starting }),
      updateDownloadById: jest.fn()
    }
    const webContents = {
      downloadURL: jest.fn()
    }

    await beginDownload({
      downloadIdContext,
      currentDownloadItems: new CurrentDownloadItems(),
      info,
      database,
      webContents
    })

    expect(database.setPreferences).toHaveBeenCalledTimes(1)
    expect(database.setPreferences).toHaveBeenCalledWith({
      defaultDownloadLocation: '/mock/location',
      lastDownloadLocation: '/mock/location'
    })

    expect(database.getDownloadById).toHaveBeenCalledTimes(1)
    expect(database.getDownloadById).toHaveBeenCalledWith('mock-id')

    expect(database.updateDownloadById).toHaveBeenCalledTimes(1)
    expect(database.updateDownloadById).toHaveBeenCalledWith('mock-id', {
      downloadLocation: '/mock/location/mock-id',
      state: downloadStates.active,
      timeStart: 1682899200000
    })

    expect(startNextDownload).toHaveBeenCalledTimes(1)
    expect(startNextDownload).toHaveBeenCalledWith(
      expect.objectContaining({
        downloadId: 'mock-id',
        downloadIdContext: {}
      })
    )
  })

  test('does not call startNextDownload if no downloads should be started', async () => {
    const downloadIdContext = {}
    const info = {
      downloadIds: ['mock-id'],
      downloadLocation: '/mock/location',
      makeDefaultDownloadLocation: false
    }
    const database = {
      setPreferences: jest.fn(),
      getDownloadById: jest.fn().mockResolvedValue({ state: downloadStates.active }),
      updateDownloadById: jest.fn()
    }
    const webContents = {
      downloadURL: jest.fn()
    }

    await beginDownload({
      downloadIdContext,
      currentDownloadItems: new CurrentDownloadItems(),
      info,
      database,
      webContents
    })

    expect(database.setPreferences).toHaveBeenCalledTimes(1)
    expect(database.setPreferences).toHaveBeenCalledWith({
      defaultDownloadLocation: undefined,
      lastDownloadLocation: '/mock/location'
    })

    expect(database.getDownloadById).toHaveBeenCalledTimes(1)
    expect(database.getDownloadById).toHaveBeenCalledWith('mock-id')

    expect(database.updateDownloadById).toHaveBeenCalledTimes(0)
    expect(startNextDownload).toHaveBeenCalledTimes(0)
  })
})
