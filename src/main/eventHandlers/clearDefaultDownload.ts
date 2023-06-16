// @ts-nocheck

/**
 * Clears the default download from the user preferences
 * @param {Object} params
 * @param {Object} params.database `EddDatabase` instance
 */
const clearDefaultDownload = async ({
  database
}) => {
  await database.setPreferences({ defaultDownloadLocation: null })
}

export default clearDefaultDownload
