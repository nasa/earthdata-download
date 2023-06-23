// @ts-nocheck

import setPreferenceFieldValue from '../setPreferenceFieldValue'

describe('set a field in the preferences', () => {
  test('Updates the value of an existing field in the preferences to specified user value', async () => {
    const database = {
      setPreferences: jest.fn()
    }

    await setPreferenceFieldValue({
      database, field: 'concurrentDownloads', value: '2'
    })

    expect(database.setPreferences).toHaveBeenCalledTimes(1)
    expect(database.setPreferences).toHaveBeenCalledWith({ concurrentDownloads: '2' })
  })
})
