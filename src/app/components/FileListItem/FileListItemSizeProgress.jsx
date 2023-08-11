import React from 'react'
import PropTypes from 'prop-types'

import convertBytes from '../../utils/convertBytes'

import * as styles from './FileListItemSizeProgress.module.scss'

const FileListItemSizeProgress = ({
  receivedBytes,
  shouldShowBytes,
  totalBytes
}) => {
  if (!shouldShowBytes) return null

  return (
    <div className={styles.statusInformationByteStats}>
      <span>
        {convertBytes(receivedBytes)}
        /
        {convertBytes(totalBytes)}
        {' '}
        downloaded
      </span>
    </div>
  )
}

FileListItemSizeProgress.defaultProps = {
  receivedBytes: 0,
  totalBytes: 0
}

FileListItemSizeProgress.propTypes = {
  receivedBytes: PropTypes.number,
  shouldShowBytes: PropTypes.bool.isRequired,
  totalBytes: PropTypes.number
}

export default FileListItemSizeProgress
