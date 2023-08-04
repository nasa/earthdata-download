// @ts-nocheck

/**
 * Set the preference field to a specific value
 * @param {Object} params
 * @param {Object} params.database `EddDatabase` instance.
 * @param {Object} params.info `info` parameter from ipc message
 */
const setPreferenceFieldValue = async ({
  database,
  info
}) => {
  const { field, value } = info
  database.setPreferences({
    [field]: value
  })
}

export default setPreferenceFieldValue
