import downloadIdForMetrics from '../downloadIdForMetrics'

describe('downloadIdForMetrics', () => {
  test('should extract download ID when it matches the pattern', () => {
    const inputDownloadId = 'downloadId-20231116_164945'
    const expectedExtractedId = 'downloadId'

    const result = downloadIdForMetrics(inputDownloadId)

    expect(result).toEqual(expectedExtractedId)
  })

  test('should return the original download ID when it does not match the pattern', () => {
    const inputDownloadId = 'invalidId123'
    const expectedDownloadId = 'invalidId123'

    const result = downloadIdForMetrics(inputDownloadId)

    expect(result).toEqual(expectedDownloadId)
  })
})
