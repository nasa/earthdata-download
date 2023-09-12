// @ts-nocheck

import { dialog } from 'electron'

import chooseDownloadLocation from '../chooseDownloadLocation'

describe('chooseDownloadLocation', () => {
  test('returns if no location was selected', async () => {
    dialog.showOpenDialogSync = jest.fn().mockReturnValue(undefined)

    const appWindow = {
      webContents: {
        send: jest.fn()
      }
    }
    const database = {
      setPreferences: jest.fn()
    }

    await chooseDownloadLocation({
      appWindow,
      database
    })

    expect(appWindow.webContents.send).toHaveBeenCalledTimes(0)
  })

  test('sends the selected download location to the renderer process', async () => {
    dialog.showOpenDialogSync = jest.fn().mockReturnValue(['/mock/path'])

    const appWindow = {
      webContents: {
        send: jest.fn()
      }
    }
    const database = {
      setPreferences: jest.fn()
    }

    await chooseDownloadLocation({
      appWindow,
      database
    })

    expect(database.setPreferences).toHaveBeenCalledTimes(1)
    expect(database.setPreferences).toHaveBeenCalledWith(
      {
        defaultDownloadLocation: '/mock/path'
      }
    )

    expect(appWindow.webContents.send).toHaveBeenCalledTimes(1)
    expect(appWindow.webContents.send).toHaveBeenCalledWith('setDownloadLocation', { downloadLocation: '/mock/path' })
  })
})
