// @ts-nocheck

import { app, net } from 'electron'

import config from '../config.json'
import downloadIdForMetrics from './downloadIdForMetrics'

/**
 * Dispatches specified events to edd_logger lambda to be logged on CloudWatch
 * @param {Object} event json object to be sent to edd_logger
 */
const metricsLogger = async (database, event) => {
  const appVersion = app.getVersion()

  const { data = {} } = event
  const { downloadId, downloadIds } = data

  const dataWithVersion = {
    ...data,
    appVersion
  }

  if (downloadId) {
    const download = await database.getDownloadById(downloadId)

    dataWithVersion.clientId = download.clientId
    dataWithVersion.downloadId = downloadIdForMetrics(downloadId)
  }

  if (downloadIds && downloadIds.length > 0) {
    dataWithVersion.clientIds = await Promise.all(downloadIds.map(async (id) => {
      const download = await database.getDownloadById(id)

      return download?.clientId
    }))

    dataWithVersion.downloadIds = downloadIds.map(downloadIdForMetrics)
  }

  const eventWithVersion = {
    ...event,
    data: dataWithVersion
  }

  const allowMetrics = await database.getPreferencesByField('allowMetrics')
  console.log(`Metrics Event (Reported: ${allowMetrics}): ${JSON.stringify(eventWithVersion)}`)

  if (!allowMetrics) {
    return
  }

  try {
    await net.fetch(config.logging, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ params: eventWithVersion })
    })
  } catch (error) {
    console.error(error)
  }
}

export default metricsLogger
