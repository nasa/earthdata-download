import React from 'react'
import PropTypes from 'prop-types'

import { FaDownload } from 'react-icons/fa'

import * as styles from './DownloadHistoryListItemTimestamp.module.scss'

/**
 * @typedef {Object} DownloadHistoryListItemTimestampProps
 * @property {Number} time The timestamp when the download started.
 */

/**
 * Renders a `DownloadHistoryListItemTimestamp` component
 * @param {DownloadHistoryListItemTimestampProps} props
 *
 * @example <caption>Renders a `DownloadHistoryListItemTimestamp` component</caption>
 * return (
 *   <DownloadHistoryListItemTimestamp
 *     time={time}
 *   />
 * )
 */
const DownloadHistoryListItemTimestamp = ({
  time
}) => {
  if (!time) return null

  const date = new Date(time)

  return (
    <div
      className={styles.time}
    >
      <FaDownload className={styles.timeIcon} />
      {' '}
      {
        date.toLocaleDateString('en-us', {
          month: 'short',
          day: 'numeric',
          year: 'numeric'
        })
      }
      {' '}
      at
      {' '}
      {
        date.toLocaleTimeString('en-us', {
          hour: 'numeric',
          minute: 'numeric',
          second: 'numeric'
        })
      }
    </div>
  )
}

DownloadHistoryListItemTimestamp.defaultProps = {
  time: null
}

DownloadHistoryListItemTimestamp.propTypes = {
  time: PropTypes.number
}

export default DownloadHistoryListItemTimestamp
