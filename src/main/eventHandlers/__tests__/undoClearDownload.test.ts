// @ts-nocheck

import undoClearDownload from '../undoClearDownload'

describe('undoClearDownload', () => {
  test('updates the database', async () => {
    const info = {
      downloadId: 'mock-download-id'
    }
    const database = {
      updateDownloadById: jest.fn()
    }

    await undoClearDownload({
      database,
      info
    })

    expect(database.updateDownloadById).toHaveBeenCalledTimes(1)
    expect(database.updateDownloadById).toHaveBeenCalledWith('mock-download-id', { active: true })
  })
})
