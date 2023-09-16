import undoDeleteDownloadHistory from '../undoDeleteDownloadHistory'

describe('undoDeleteDownloadHistory', () => {
  test('updates the database', async () => {
    const info = {
      deleteId: 'mock-delete-id'
    }
    const database = {
      clearDeleteId: jest.fn()
    }

    await undoDeleteDownloadHistory({
      database,
      info
    })

    expect(database.clearDeleteId).toHaveBeenCalledTimes(1)
    expect(database.clearDeleteId).toHaveBeenCalledWith('mock-delete-id')
  })
})
