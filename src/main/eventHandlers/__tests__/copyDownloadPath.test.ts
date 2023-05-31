import { clipboard } from 'electron'
import copyDownloadPath from '../copyDownloadPath'

jest.mock('electronClipboard', () => ({
  clipboard: {
    writeText: jest.fn()
  }
}))

describe('copyDownloadPath', () => {
  test('copies the download path to the clipboard using clipboard.writeText', () => {
    const info = {
      downloadId: 'shortName_version-1-20230514_012554'
    }

    const store = {
      get: jest.fn().mockReturnValue('/mock/location/shortName_version-1-20230514_012554')
    }

    copyDownloadPath({ info, store })

    expect(clipboard.writeText).toHaveBeenCalledWith('/mock/location/shortName_version-1-20230514_012554')
  })
})
