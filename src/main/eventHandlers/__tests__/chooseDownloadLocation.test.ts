import { dialog } from 'electron'

import chooseDownloadLocation from '../chooseDownloadLocation'

describe('chooseDownloadLocation', () => {
  test('returns if no location was selected', () => {
    dialog.showOpenDialogSync = jest.fn().mockReturnValue(undefined)

    const appWindow = {
      webContents: {
        send: jest.fn()
      }
    }

    chooseDownloadLocation({ appWindow })

    expect(appWindow.webContents.send).toHaveBeenCalledTimes(0)
  })

  test('sends the selected download location to the renderer process', () => {
    dialog.showOpenDialogSync = jest.fn().mockReturnValue(['/mock/path'])

    const appWindow = {
      webContents: {
        send: jest.fn()
      }
    }

    chooseDownloadLocation({ appWindow })

    expect(appWindow.webContents.send).toHaveBeenCalledTimes(1)
    expect(appWindow.webContents.send).toHaveBeenCalledWith('setDownloadLocation', { downloadLocation: '/mock/path' })
  })
})
