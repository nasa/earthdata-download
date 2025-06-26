// @ts-nocheck

import { app } from 'electron'
import https from 'https'

import config from '../config.json'
import downloadIdForMetrics from './downloadIdForMetrics'

const httpsAgent = new https.Agent({
  rejectUnauthorized: false
})

/**
 * Dispatches specified events to edd_logger lambda to be logged on CloudWatch
 * @param {Object} event json object to be sent to edd_logger
 */
const metricsLogger = async (database, event) => {
  const appVersion = app.getVersion()

  const { data } = event
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
    dataWithVersion.clientIds = downloadIds.map((id) => {
      const download = database.getDownloadById(id)

      return download?.clientId
    })

    dataWithVersion.downloadIds = downloadIds.map(downloadIdForMetrics)
  }

  const eventWithVersion = {
    ...event,
    data: dataWithVersion
  }

  console.log(`Metrics Event: ${JSON.stringify(eventWithVersion)}`)

  const allowMetrics = await database.getPreferencesByField('allowMetrics')
  if (!allowMetrics) {
    return
  }

  try {
    await fetch(config.logging, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ params: eventWithVersion }),
      agent: httpsAgent
    })
  } catch (error) {
    console.error(error)
  }
}

export default metricsLogger
