// @ts-nocheck

import fetch from 'node-fetch'

import config from '../config.json'

/**
 * Dispatches specified events to edd_logger lambda to be logged on CloudWatch
 * @param {Object} event json object to be sent to edd_logger
 */
const metricsLogger = async (event: any) => {
  try {
    const response = await fetch(config.logging, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ params: event })
    })

    console.log(response)
  } catch (error) {
    console.error(error)
  }
}

export default metricsLogger
