// @ts-nocheck

import getPreferenceFieldValue from '../getPreferenceFieldValue'

describe('Get the current value in the preferences file for provided field', () => {
  test('clears the default download location from preferences', async () => {
    const database = {
      getPreferencesByField: jest.fn().mockReturnValue({
        defaultDownloadLocation: '/mock/default/location'
      })
    }
    const retrievedField = await getPreferenceFieldValue({ database, field: 'defaultDownloadLocation' })
    expect(database.getPreferencesByField).toHaveBeenCalledTimes(1)
    expect(retrievedField).toEqual({ defaultDownloadLocation: '/mock/default/location' })
  })
})
