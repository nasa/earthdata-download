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
      // eslint-disable-next-line no-case-declarations
      const { concurrentDownloads } = await database.getPreferences()
      if (concurrentDownloads !== value) {
        metricsLogger({
          eventType: 'NewConcurrentDownloadsLimit',
          data: {
            newConcurrentDownloads: value
          }
        })
      }

      break

    case 'defaultDownloadLocation':
      metricsLogger({
        eventType: 'NewDefaultDownloadLocatin'
      })

      break

    default:
      break
  }

  database.setPreferences({
    [field]: value
  })
}

export default setPreferenceFieldValue
