import { shell } from 'electron'
import openDownloadFolder from '../openDownloadFolder'

jest.mock('electronShell', () => ({
  shell: {
    openPath: jest.fn()
  }
}))

describe('openDownloadFolder', () => {
  test('opens the download folder using shell.openPath', async () => {
    const info = {
      downloadId: 'shortName_version-1-20230514_012554'
    }

    const downloadLocation = '/mock/location/shortName_version-1-20230514_012554'

    const database = {
      getDownloadById: jest.fn().mockReturnValue({ downloadLocation })
    }

    await openDownloadFolder({
      database,
      info
    })

    expect(database.getDownloadById).toHaveBeenCalledTimes(1)
    expect(database.getDownloadById).toHaveBeenCalledWith('shortName_version-1-20230514_012554')

    expect(shell.openPath).toHaveBeenCalledWith(downloadLocation)
  })

  describe('when the filename is provided', () => {
    test('the file will be opened', async () => {
      const filename = 'mock-filename.png'
      const info = {
        downloadId: 'shortName_version-1-20230514_012554',
        filename
      }

      const downloadLocation = '/mock/location/shortName_version-1-20230514_012554'

      const database = {
        getDownloadById: jest.fn().mockReturnValue({ downloadLocation })
      }

      await openDownloadFolder({
        database,
        info
      })

      const filePath = `${downloadLocation}/${filename}`

      expect(database.getDownloadById).toHaveBeenCalledTimes(1)
      expect(database.getDownloadById).toHaveBeenCalledWith('shortName_version-1-20230514_012554')

      expect(shell.openPath).toHaveBeenCalledWith(filePath)
    })
  })
})
