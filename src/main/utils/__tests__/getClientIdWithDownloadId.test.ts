import getClientIdWithDownloadId from '../getClientIdWithDownloadId'

describe('getClientIdWithDownloadId', () => {
  describe('when downloadId exists in database', () => {
    test('returns JSON object including clientId and downloadId', async () => {
      const downloadId = 'mock-download-id'
      const clientId = 'eed-edsc-dev-serverless-client'
      const database = {
        getDownloadById: jest.fn().mockResolvedValue({
          downloadId,
          clientId
        })
      }
      const result = await getClientIdWithDownloadId({
        database,
        downloadId
      })
      expect(result).toEqual({
        clientId,
        downloadId
      })

      expect(database.getDownloadById).toHaveBeenCalledTimes(1)
      expect(database.getDownloadById).toHaveBeenCalledWith(downloadId)
    })
  })

  describe('when downloadId does not exist in database', () => {
    test('returns JSON object with null clientId and downloadId passed in, logs error', async () => {
      const downloadId = 'mock-download-id'
      const consoleMock = jest.spyOn(console, 'log').mockImplementation(() => {})
      const database = {
        getDownloadById: jest.fn().mockResolvedValue(null)
      }
      const result = await getClientIdWithDownloadId({
        database,
        downloadId
      })
      expect(result).toEqual({
        clientId: null,
        downloadId
      })

      expect(database.getDownloadById).toHaveBeenCalledTimes(1)
      expect(database.getDownloadById).toHaveBeenCalledWith(downloadId)
      expect(consoleMock).toHaveBeenCalledTimes(1)
      expect(consoleMock).toHaveBeenCalledWith(`Error in getClientIdWithDownloadId called with downloadId: ${downloadId}, error: TypeError: Cannot read properties of null (reading 'clientId')`)
    })
  })
})
