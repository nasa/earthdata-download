import { app } from 'electron'
import MockDate from 'mockdate'

import clearDefaultDownload from '../clearDefaultDownload'

beforeEach(() => {
  MockDate.set('2023-05-01')
  app.getPath = jest.fn().mockReturnValue('/Downloads')
})

describe('clearDefaultDownload', () => {
  test('clears the default download location from preferences', () => {
    const database = {
      setPreferences: jest.fn()
    }

    clearDefaultDownload({
      database
    })

    expect(database.setPreferences).toHaveBeenCalledTimes(1)
    expect(database.setPreferences).toHaveBeenCalledWith({
      defaultDownloadLocation: null
    })
  })
})
