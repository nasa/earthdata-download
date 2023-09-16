// @ts-nocheck

import undoClearDownload from '../undoClearDownload'

describe('undoClearDownload', () => {
  test('updates the database', async () => {
    const info = {
      clearId: 'mock-clear-id'
    }
    const database = {
      updateDownloadsWhere: jest.fn()
    }

    await undoClearDownload({
      database,
      info
    })

    expect(database.updateDownloadsWhere).toHaveBeenCalledTimes(1)
    expect(database.updateDownloadsWhere).toHaveBeenCalledWith({
      clearId: 'mock-clear-id'
    }, {
      active: true,
      clearId: null
    })
  })
})
