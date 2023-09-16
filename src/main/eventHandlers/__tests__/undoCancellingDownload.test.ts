import undoCancellingDownload from '../undoCancellingDownload'

describe('undoCancellingDownload', () => {
  test('updates the database', async () => {
    const info = {
      cancelId: 'mock-delete-id'
    }
    const database = {
      updateDownloadsWhere: jest.fn(),
      updateFilesWhere: jest.fn()
    }

    await undoCancellingDownload({
      database,
      info
    })

    expect(database.updateDownloadsWhere).toHaveBeenCalledTimes(1)
    expect(database.updateDownloadsWhere).toHaveBeenCalledWith({
      cancelId: 'mock-delete-id'
    }, {
      cancelId: null
    })

    expect(database.updateFilesWhere).toHaveBeenCalledTimes(1)
    expect(database.updateFilesWhere).toHaveBeenCalledWith({
      cancelId: 'mock-delete-id'
    }, {
      cancelId: null
    })
  })
})
