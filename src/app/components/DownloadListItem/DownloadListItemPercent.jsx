import React from 'react'
import PropTypes from 'prop-types'

import * as styles from './DownloadListItemPercent.module.scss'

const DownloadListItemPercent = ({
  percent
}) => {
  if (!percent) return null

  return (
    <div
      className={styles.percentComplete}
      data-testid="download-item-percent"
    >
      {percent}
      %
    </div>
  )
}

DownloadListItemPercent.propTypes = {
  percent: PropTypes.number.isRequired
}

export default DownloadListItemPercent
