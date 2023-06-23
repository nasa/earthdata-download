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
  console.log('🚀 ~ file: setPreferenceFieldValue.ts:14 ~ database:', database)
  // const preferences = store.get('preferences')
  const preferences = await database.getPreferences()
  console.log('🚀 ~ file: setPreferenceFieldValue.ts:16 ~ preferences:', preferences)
  // Write to the preferences the user defined field and value
  database.setPreferences({
    [field]: value
  })
}

export default setPreferenceFieldValue
