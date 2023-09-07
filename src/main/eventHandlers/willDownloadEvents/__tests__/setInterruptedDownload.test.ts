// @ts-nocheck

import MockDate from 'mockdate'

import setInterruptedDownload from '../setInterruptedDownload'

import downloadStates from '../../../../app/constants/downloadStates'

beforeEach(() => {
  MockDate.set('2023-05-13T22:00:00.000')
})

describe('setInterruptedDownload', () => {
  test('marks the download as interrupted if all files not active', async () => {
    const database = {
      getActiveFilesCountByDownloadId: jest.fn().mockResolvedValue(0),
      createPauseByDownloadId: jest.fn(),
      updateDownloadById: jest.fn()
    }

    await setInterruptedDownload({
      database,
      downloadId: 'mock-download-id'
    })

    expect(database.createPauseByDownloadId).toHaveBeenCalledTimes(1)
    expect(database.createPauseByDownloadId).toHaveBeenCalledWith('mock-download-id', false)

    expect(database.updateDownloadById).toHaveBeenCalledTimes(1)
    expect(database.updateDownloadById).toHaveBeenCalledWith(
      'mock-download-id',
      {
        state: downloadStates.interrupted
      }
    )
  })

  test('does not mark the download as completed if files are still downloading', async () => {
    const database = {
      getActiveFilesCountByDownloadId: jest.fn().mockResolvedValue(1),
      createPauseByDownloadId: jest.fn(),
      updateDownloadById: jest.fn()
    }

    await setInterruptedDownload({
      database,
      downloadId: 'mock-download-id'
    })

    expect(database.createPauseByDownloadId).toHaveBeenCalledTimes(0)
    expect(database.updateDownloadById).toHaveBeenCalledTimes(0)
  })
})
