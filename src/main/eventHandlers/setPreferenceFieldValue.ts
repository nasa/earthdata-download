// @ts-nocheck

/**
 * Clears the default download from the user preferences
 * @param {Object} params
 * @param {Object} params.database `EddDatabase` instance
 * @param {Object} params.field user defined concurrent downloads
 */
const setPreferenceFieldValue = async ({
  database,
  field,
  value
}) => {
  database.setPreferences({
    [field]: value
  })
}

export default setPreferenceFieldValue
