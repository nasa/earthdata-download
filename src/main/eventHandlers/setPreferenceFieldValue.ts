// @ts-nocheck

/**
 * Clears the default download from the user preferences
 * @param {Object} params
 * @param {Object} params.store `electron-store` instance
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
