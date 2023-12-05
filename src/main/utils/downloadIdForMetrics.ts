// @ts-nocheck

/**
 * Trims timestamp suffix from downloadId
 * @param {String} downloadId downloadId for a given download
 */
const downloadIdForMetrics = (downloadId) => {
  const downloadIdString = downloadId.toString()

  const regexPattern = /^(.+)-\d{8}_\d{6}$/
  const match = downloadIdString.match(regexPattern)

  if (match) {
    return match[0]
  }

  return downloadId
}

export default downloadIdForMetrics
