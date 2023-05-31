import { app } from 'electron'
import MockDate from 'mockdate'

import clearDefaultDownload from '../clearDefaultDownload'

beforeEach(() => {
  MockDate.set('2023-05-01')
  app.getPath = jest.fn().mockReturnValue('/Downloads')
})

describe('clearDefaultDownload', () => {
  test('clears the default download location from preferences', () => {
    const store = {
      set: jest.fn(),
      get: jest.fn().mockReturnValue({
        defaultDownloadLocation: '/mock/default/location',
        lastDownloadLocation: '/mock/last/location'
      })
    }

    clearDefaultDownload({
      store
    })

    expect(store.get).toHaveBeenCalledTimes(1)
    expect(store.set).toHaveBeenCalledTimes(1)
    expect(store.set).toHaveBeenCalledWith('preferences', {
      defaultDownloadLocation: undefined,
      lastDownloadLocation: '/mock/last/location'
    })
  })
})
