// @ts-nocheck

/**
 * gets the concurrency download from the user preferences
 * @param {Object} params
 * @param {Object} params.database `EddDatabase` instance
 * @param {String} params.field Name of the preferences field
 */
const getPreferenceFieldValue = async ({
  database,
  field
}) => {
  const preferenceFieldValue = await database.getPreferencesByField(field)
  return preferenceFieldValue
}

export default getPreferenceFieldValue
