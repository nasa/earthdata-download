// @ts-nocheck

/**
 * gets the concurrency download from the user preferences
 * @param {Object} params
 * @param {Object} params.store `electron-store` instance
 * @param {string} params.field Name of the preferences field
 */
const getPreferenceFieldValue = ({
  store,
  field
}) => {
  const preferences = store.get('preferences')
  const { [field]: fieldValue } = preferences
  return fieldValue
}

export default getPreferenceFieldValue
