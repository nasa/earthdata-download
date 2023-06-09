// @ts-nocheck

import setPreferenceFieldValue from '../setPreferenceFieldValue'

describe('set a field in the preferences', () => {
  test('Updates the value of an existing field in the preferences to specified user value', () => {
    const store = {
      set: jest.fn(),
      get: jest.fn().mockReturnValue({
        concurrentDownloads: '5'
      })
    }
    setPreferenceFieldValue({
      store, field: 'concurrentDownloads', value: '2'
    })

    expect(store.get).toHaveBeenCalledTimes(1)
    expect(store.set).toHaveBeenCalledTimes(1)
    expect(store.set).toHaveBeenCalledWith('preferences', {
      concurrentDownloads: '2'
    })
  })
})
