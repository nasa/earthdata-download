// @ts-nocheck
import metricsLogger from '../utils/metricsLogger'

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
  switch (field) {
    case 'concurrentDownloads':
      metricsLogger(database, {
        eventType: 'NewConcurrentDownloadsLimit',
        data: {
          newConcurrentDownloads: value
        }
      })

      break

    case 'defaultDownloadLocation':
      metricsLogger(database, {
        eventType: 'NewDefaultDownloadLocation'
      })

      break

    default:
      break
  }

  const preferences = {
    [field]: value
  }

  if (field === 'allowMetrics') {
    preferences.hasMetricsPreferenceBeenSet = 1
  }

  await database.setPreferences(preferences)
}

export default setPreferenceFieldValue
