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
})
