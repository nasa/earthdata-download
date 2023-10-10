import React from 'react'
import PropTypes from 'prop-types'

import * as styles from './FileListItemPercent.module.scss'

/**
 * @typedef {Object} FileListItemPercentProps
 * @property {Number} percent The download percent of the DownloadItem.
 */

/**
 * Renders a `FileListItemPercent` component
 * @param {FileListItemPercentProps} props
 *
 * @example <caption>Renders a `FileListItemPercent` component</caption>
 * return (
 *   <FileListItemPercent
 *     percent={percent}
 *   />
 * )
 */
const FileListItemPercent = ({
  percent
}) => {
  if (!percent) return null

  return (
    <div className={styles.percentComplete}>
      {Math.round(percent)}
      %
    </div>
  )
}

FileListItemPercent.propTypes = {
  percent: PropTypes.number.isRequired
}

export default FileListItemPercent
