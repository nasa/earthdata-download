import undoRestartingDownload from '../undoRestartingDownload'

describe('undoRestartingDownload', () => {
  test('calls database.clearDeleteId', async () => {
    const info = {
      restartId: 'mock-delete-id'
    }
    const database = {
      updateDownloadsWhere: jest.fn(),
      updateFilesWhere: jest.fn()
    }

    await undoRestartingDownload({
      database,
      info
    })

    expect(database.updateDownloadsWhere).toHaveBeenCalledTimes(1)
    expect(database.updateDownloadsWhere).toHaveBeenCalledWith({
      restartId: 'mock-delete-id'
    }, {
      restartId: null
    })

    expect(database.updateFilesWhere).toHaveBeenCalledTimes(1)
    expect(database.updateFilesWhere).toHaveBeenCalledWith({
      restartId: 'mock-delete-id'
    }, {
      restartId: null
    })
  })
})
