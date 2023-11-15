// @ts-nocheck

import setPreferenceFieldValue from '../setPreferenceFieldValue'

jest.mock('../../utils/metricsLogger.ts', () => ({
  __esModule: true,
  default: jest.fn(() => {})
}))

describe('set a field in the preferences', () => {
  test('Updates the value of an existing "concurrentDownloads" field in the preferences to the specified user value', async () => {
    const database = {
      setPreferences: jest.fn(),
      getPreferences: jest.fn().mockResolvedValue({ concurrentDownloads: 5 })
    }
    const info = {
      field: 'concurrentDownloads',
      value: '2'
    }
    await setPreferenceFieldValue({
      database,
      info
    })

    expect(database.setPreferences).toHaveBeenCalledTimes(1)
    expect(database.setPreferences).toHaveBeenCalledWith({ concurrentDownloads: '2' })
  })

  test('Updates the "defaultDownloadLocation" field in the preferences', async () => {
    const database = {
      setPreferences: jest.fn(),
      getPreferences: jest.fn().mockResolvedValue({})
    }
    const info = {
      field: 'defaultDownloadLocation',
      value: 'new/location'
    }
    await setPreferenceFieldValue({
      database,
      info
    })

    expect(database.setPreferences).toHaveBeenCalledTimes(1)
    expect(database.setPreferences).toHaveBeenCalledWith({ defaultDownloadLocation: 'new/location' })
  })
})
