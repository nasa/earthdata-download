import processDownloadIdsForMetrics from '../processDownloadIdsForMetrics'

describe('processDownloadIdsForMetrics', () => {
  describe('processDownloadIdsForMetrics called with a list of ids', () => {
    test('returned listed of JSON objects including clientId and downloadId', async () => {
      const downloadIds = ['mock-download-id1', 'mock-download-id2', 'mock-download-id3']
      const clientId1 = 'eed-edsc-dev-serverless-client'
      const clientId2 = 'test-client'
      const database = {
        getDownloadById: jest.fn().mockResolvedValueOnce({
          clientId: clientId1,
          downloadId: 'mock-download-id1'
        }).mockResolvedValueOnce({
          clientId: clientId2,
          downloadId: 'mock-download-id2'
        }).mockResolvedValueOnce({
          clientId: clientId1,
          downloadId: 'mock-download-id3'
        })
      }
      const expectedResult = [{
        clientId: clientId1,
        downloadId: 'mock-download-id1'
      }, {
        clientId: clientId2,
        downloadId: 'mock-download-id2'
      }, {
        clientId: clientId1,
        downloadId: 'mock-download-id3'
      }]
      const result = await processDownloadIdsForMetrics({
        database,
        downloadIds
      })
      expect(result).toEqual(expectedResult)
      expect(database.getDownloadById).toHaveBeenCalledTimes(3)
      expect(database.getDownloadById).toHaveBeenCalledWith('mock-download-id1')
      expect(database.getDownloadById).toHaveBeenCalledWith('mock-download-id2')
      expect(database.getDownloadById).toHaveBeenCalledWith('mock-download-id3')
    })
  })

  describe('processDownloadIdsForMetrics called with null list of downloadIds', () => {
    test('returned empty list', async () => {
      const downloadIds = []
      const database = {
        getDownloadById: jest.fn()
      }
      const expectedResult = []
      const result = await processDownloadIdsForMetrics({
        database,
        downloadIds
      })
      expect(result).toEqual(expectedResult)
      expect(database.getDownloadById).toHaveBeenCalledTimes(0)
    })
  })
})
