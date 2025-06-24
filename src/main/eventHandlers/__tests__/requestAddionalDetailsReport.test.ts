// @ts-nocheck

import requestAddionalDetailsReport from '../requestAddionalDetailsReport'

describe('requestAddionalDetailsReport', () => {
  test('returns an empty report when no downloads exist', async () => {
    const database = {
      getAdditionalDetailsReport: jest.fn()
        .mockResolvedValue([{
          duplicateCount: 0,
          invalidLinksCount: 0
        }])
    }

    const result = await requestAddionalDetailsReport({
      database,
      info: {
        downloadId: 'mock-download-id'
      }
    })

    expect(result).toEqual({
      duplicateCount: 0,
      invalidLinksCount: 0
    })

    expect(database.getAdditionalDetailsReport).toHaveBeenCalledTimes(1)
    expect(database.getAdditionalDetailsReport).toHaveBeenCalledWith('mock-download-id')
  })
})
