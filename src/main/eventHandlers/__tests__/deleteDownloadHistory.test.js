import deleteDownloadHistory from '../deleteDownloadHistory'

describe('deleteDownloadHistory', () => {
  test('calls database.deleteByDeleteId', async () => {
    const info = {
      deleteId: 'mock-delete-id'
    }
    const database = {
      deleteByDeleteId: jest.fn()
    }

    await deleteDownloadHistory({
      database,
      info
    })

    expect(database.deleteByDeleteId).toHaveBeenCalledTimes(1)
    expect(database.deleteByDeleteId).toHaveBeenCalledWith('mock-delete-id')
  })
})
