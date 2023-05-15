const { dialog } = require('electron')

const chooseDownloadLocation = require('../chooseDownloadLocation')

describe('chooseDownloadLocation', () => {
  test('returns if no location was selected', () => {
    dialog.showOpenDialogSync = jest.fn().mockReturnValue(undefined)

    const window = {
      webContents: {
        send: jest.fn()
      }
    }

    chooseDownloadLocation({ window })

    expect(window.webContents.send).toHaveBeenCalledTimes(0)
  })

  test('sends the selected download location to the renderer process', () => {
    dialog.showOpenDialogSync = jest.fn().mockReturnValue(['/mock/path'])

    const window = {
      webContents: {
        send: jest.fn()
      }
    }

    chooseDownloadLocation({ window })

    expect(window.webContents.send).toHaveBeenCalledTimes(1)
    expect(window.webContents.send).toHaveBeenCalledWith('setDownloadLocation', { downloadLocation: '/mock/path' })
  })
})
