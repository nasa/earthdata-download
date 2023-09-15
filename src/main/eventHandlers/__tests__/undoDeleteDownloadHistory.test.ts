import undoDeleteDownloadHistory from '../undoDeleteDownloadHistory'

describe('undoDeleteDownloadHistory', () => {
  test('calls database.clearDeleteId', async () => {
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
