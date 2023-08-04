// @ts-nocheck

import setPreferenceFieldValue from '../setPreferenceFieldValue'

describe('set a field in the preferences', () => {
  test('Updates the value of an existing field in the preferences to specified user value', async () => {
    const database = {
      setPreferences: jest.fn()
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
})
