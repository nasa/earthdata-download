const { shell } = require('electron')
const openDownloadFolder = require('../openDownloadFolder')

jest.mock('electronShell', () => ({
  shell: {
    openPath: jest.fn()
  }
}))

describe('openDownloadFolder', () => {
  test('opens the download folder using shell.openPath', () => {
    const info = {
      downloadId: 'shortName_version-1-20230514_012554'
    }

    const folderPath = '/mock/location/shortName_version-1-20230514_012554'

    const store = {
      get: jest.fn().mockReturnValue(folderPath)
    }

    openDownloadFolder({ info, store })

    expect(shell.openPath).toHaveBeenCalledWith(folderPath)
  })
})
