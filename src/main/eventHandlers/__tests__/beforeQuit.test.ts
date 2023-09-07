// @ts-nocheck

import MockDate from 'mockdate'
import { dialog } from 'electron'

import beforeQuit from '../beforeQuit'

import downloadStates from '../../../app/constants/downloadStates'

beforeEach(() => {
  MockDate.set('2023-05-01')
})

describe('beforeQuit', () => {
  test('returns if no downloads are running', async () => {
    dialog.showMessageBoxSync = jest.fn()
    const currentDownloadItems = {
      getNumberOfDownloads: jest.fn().mockReturnValue(0),
      pauseItem: jest.fn()
    }
    const database = {}
    const event = {
      preventDefault: jest.fn()
    }

    await beforeQuit({
      currentDownloadItems,
      database,
      event
    })

    expect(event.preventDefault).toHaveBeenCalledTimes(0)
    expect(dialog.showMessageBoxSync).toHaveBeenCalledTimes(0)
  })

  test('returns false if Quit was selected', async () => {
    dialog.showMessageBoxSync = jest.fn().mockReturnValue(0)
    const currentDownloadItems = {
      getNumberOfDownloads: jest.fn().mockReturnValue(1),
      pauseItem: jest.fn()
    }
    const database = {
      updateDownloadsWhereIn: jest.fn().mockResolvedValue([{
        id: 123
      }, {
        id: 456
      }]),
      createPauseWith: jest.fn()
    }
    const event = {
      preventDefault: jest.fn()
    }

    await beforeQuit({
      currentDownloadItems,
      database,
      event
    })

    expect(dialog.showMessageBoxSync).toHaveBeenCalledTimes(1)

    expect(database.updateDownloadsWhereIn).toHaveBeenCalledTimes(1)
    expect(database.updateDownloadsWhereIn).toHaveBeenCalledWith(
      [
        'state',
        [downloadStates.active]
      ],
      {
        state: downloadStates.appQuitting
      }
    )

    expect(database.createPauseWith).toHaveBeenCalledTimes(2)
    expect(database.createPauseWith).toHaveBeenCalledWith({
      downloadId: 123,
      timeStart: 1682899200000
    })

    expect(database.createPauseWith).toHaveBeenCalledWith({
      downloadId: 456,
      timeStart: 1682899200000
    })

    expect(event.preventDefault).toHaveBeenCalledTimes(0)
  })

  test('calls event.preventDefault if cancelled was selected', async () => {
    dialog.showMessageBoxSync = jest.fn().mockReturnValue(1)
    const currentDownloadItems = {
      getNumberOfDownloads: jest.fn().mockReturnValue(1),
      pauseItem: jest.fn()
    }
    const database = {}
    const event = {
      preventDefault: jest.fn()
    }

    await beforeQuit({
      currentDownloadItems,
      database,
      event
    })

    expect(event.preventDefault).toHaveBeenCalledTimes(1)
  })
})
