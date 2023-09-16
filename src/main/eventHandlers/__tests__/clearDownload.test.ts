// @ts-nocheck

import clearDownload from '../clearDownload'

describe('clearDownload', () => {
  test('updates the database', async () => {
    const info = {
      clearId: 'mock-clear-id',
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
    expect(database.clearDownload).toHaveBeenCalledWith('mock-download-id', 'mock-clear-id')
  })
})
