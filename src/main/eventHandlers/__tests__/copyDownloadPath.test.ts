import { clipboard } from 'electron'
import copyDownloadPath from '../copyDownloadPath'

jest.mock('electronClipboard', () => ({
  clipboard: {
    writeText: jest.fn()
  }
}))

describe('copyDownloadPath', () => {
  test('copies the download path to the clipboard using clipboard.writeText', async () => {
    const info = {
      downloadId: 'shortName_version-1-20230514_012554'
    }

    const downloadLocation = '/mock/location/shortName_version-1-20230514_012554'

    const database = {
      getDownloadById: jest.fn().mockReturnValue({ downloadLocation })
    }

    await copyDownloadPath({ database, info })

    expect(database.getDownloadById).toHaveBeenCalledTimes(1)
    expect(database.getDownloadById).toHaveBeenCalledWith('shortName_version-1-20230514_012554')

    expect(clipboard.writeText).toHaveBeenCalledWith(downloadLocation)
  })
})
