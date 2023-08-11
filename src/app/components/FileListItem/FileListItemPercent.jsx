import React from 'react'
import PropTypes from 'prop-types'

import * as styles from './FileListItemPercent.module.scss'

const FileListItemPercent = ({
  percent
}) => {
  if (!percent) return null

  return (
    <div className={styles.percentComplete}>
      {percent}
      %
    </div>
  )
}

FileListItemPercent.propTypes = {
  percent: PropTypes.number.isRequired
}

export default FileListItemPercent
