// @ts-nocheck

import getPreferenceFieldValue from '../getPreferenceFieldValue'

describe('Get the current value in the preferences file for provided field', () => {
  test('clears the default download location from preferences', () => {
    const store = {
      get: jest.fn().mockReturnValue({
        defaultDownloadLocation: '/mock/default/location'
      })
    }
    const retrievedField = getPreferenceFieldValue({ store, field: 'defaultDownloadLocation' })
    expect(store.get).toHaveBeenCalledTimes(1)
    expect(retrievedField).toEqual('/mock/default/location')
  })
})
