import setPendingDeleteDownloadHistory from '../setPendingDeleteDownloadHistory'

describe('setPendingDeleteDownloadHistory', () => {
  test('calls database.addDeleteId', async () => {
    const info = {
      downloadId: 'mock-download-id',
      deleteId: 'mock-delete-id'
    }
    const database = {
      addDeleteId: jest.fn()
    }

    await setPendingDeleteDownloadHistory({
      database,
      info
    })

    expect(database.addDeleteId).toHaveBeenCalledTimes(1)
    expect(database.addDeleteId).toHaveBeenCalledWith('mock-download-id', 'mock-delete-id')
  })
})
