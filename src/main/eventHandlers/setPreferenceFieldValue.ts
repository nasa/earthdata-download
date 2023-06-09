// @ts-nocheck

/**
 * Clears the default download from the user preferences
 * @param {Object} params
 * @param {Object} params.store `electron-store` instance
 * @param {Object} params.field user defined concurrent downloads
 */
const setPreferenceFieldValue = ({
  store,
  field,
  value
}) => {
  const preferences = store.get('preferences')
  // Write to the preferences the user defined field and value
  store.set('preferences', {
    ...preferences,
    [field]: value
  })
}

export default setPreferenceFieldValue
