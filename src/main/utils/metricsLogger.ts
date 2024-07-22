// @ts-nocheck

import { app } from 'electron'
import fetch from 'node-fetch'

import config from '../config.json'

/**
 * Dispatches specified events to edd_logger lambda to be logged on CloudWatch
 * @param {Object} event json object to be sent to edd_logger
 */
const metricsLogger = async (database, event) => {
  const appVersion = app.getVersion()

  const eventWithVersion = {
    ...event,
    appVersion
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
      body: JSON.stringify({ params: eventWithVersion })
    })
  } catch (error) {
    console.error(error)
  }
}

export default metricsLogger
