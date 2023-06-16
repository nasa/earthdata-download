import openUrl from '../openUrl'

import fetchLinks from '../../utils/fetchLinks'

jest.mock('../../utils/fetchLinks', () => ({
  __esModule: true,
  default: jest.fn(() => {})
}))

describe('openUrl', () => {
  test('calls fetchLinks', () => {
    const appWindow = {}
    const deepLink = 'earthdata-download://startDownload?getLinks=http%3A%2F%2Flocalhost%3A3000%2Fgranule_links%3Fid%3D42%26flattenLinks%3Dtrue%26linkTypes%3Ddata&downloadId=shortName_versionId&token=Bearer mock-token'
    const database = {}

    openUrl({
      appWindow,
      currentDownloadItems: {},
      database,
      deepLink,
      downloadIdContext: {}
    })

    expect(fetchLinks).toHaveBeenCalledTimes(1)
    expect(fetchLinks).toHaveBeenCalledWith({
      appWindow: {},
      database: {},
      downloadId: 'shortName_versionId',
      getLinks: 'http://localhost:3000/granule_links?id=42&flattenLinks=true&linkTypes=data',
      reAuthUrl: null,
      token: 'Bearer mock-token'
    })
  })

  test('does not call fetchLinks for the wrong hostname', () => {
    const appWindow = {}
    const deepLink = 'earthdata-download://wrongHostname?getLinks=http%3A%2F%2Flocalhost%3A3000%2Fgranule_links%3Fid%3D42%26flattenLinks%3Dtrue%26linkTypes%3Ddata&downloadId=shortName_versionId&token=Bearer mock-token'
    const database = {}

    openUrl({
      appWindow,
      currentDownloadItems: {},
      database,
      deepLink,
      downloadIdContext: {}
    })

    expect(fetchLinks).toHaveBeenCalledTimes(0)
  })
})
