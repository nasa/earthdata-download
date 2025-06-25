// @ts-nocheck

/**
 * Reports current progress on downloads
 * @param {Object} params
 * @param {Object} params.database `EddDatabase` instance
 * @param {Object} params.info Electron BrowserWindow instance's webContents
 * @param {String} params.info.downloadId Download ID to fetch additional details report
 */
const requestAddionalDetailsReport = async ({
  database,
  info
}) => {
  const {
    downloadId
  } = info

  const [report] = await database.getAdditionalDetailsReport(downloadId)

  return report
}

export default requestAddionalDetailsReport
