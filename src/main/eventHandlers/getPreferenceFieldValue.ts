// @ts-nocheck

/**
 * Gets the specific value for a provided field in preferences table
 * @param {Object} params
 * @param {Object} params.database `EddDatabase` instance
 * @param {String} params.info `info` parameter from ipc message
 */
const getPreferenceFieldValue = async ({
  database,
  info
}) => {
  const preferenceFieldValue = await database.getPreferencesByField(info)

  return preferenceFieldValue
}

export default getPreferenceFieldValue
