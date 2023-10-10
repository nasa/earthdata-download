import React from 'react'
import PropTypes from 'prop-types'

import * as styles from './DownloadListItemPercent.module.scss'

/**
 * @typedef {Object} DownloadListItemPercentProps
 * @property {Number} percent The download percent of the DownloadItem.
 */

/**
 * Renders a `DownloadListItemPercent` component
 * @param {DownloadListItemPercentProps} props
 *
 * @example <caption>Renders a `DownloadListItemPercent` component</caption>
 * return (
 *   <DownloadListItemPercent
 *     percent={percent}
 *   />
 * )
 */
const DownloadListItemPercent = ({
  percent
}) => {
  if (!percent) return null

  return (
    <div
      className={styles.percentComplete}
    >
      {Math.round(percent)}
      %
    </div>
  )
}

DownloadListItemPercent.propTypes = {
  percent: PropTypes.number.isRequired
}

export default DownloadListItemPercent
