// @ts-nocheck

import clearDownload from '../clearDownload'

describe('clearDownload', () => {
  test('calls database.clearDownload', async () => {
    const info = {
      downloadId: 'mock-download-id'
    }
    const database = {
      clearDownload: jest.fn()
    }

    await clearDownload({
      database,
      info
    })

    expect(database.clearDownload).toHaveBeenCalledTimes(1)
    expect(database.clearDownload).toHaveBeenCalledWith('mock-download-id')
  })
})
