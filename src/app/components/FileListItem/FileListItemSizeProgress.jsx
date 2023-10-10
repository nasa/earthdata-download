import React from 'react'
import PropTypes from 'prop-types'
import { FaDownload } from 'react-icons/fa'

import convertBytes from '../../utils/convertBytes'

import * as styles from './FileListItemSizeProgress.module.scss'

/**
 * @typedef {Object} FileListItemSizeProgressProps
 * @property {Number} receivedBytes Received number of bytes in the download.
 * @property {Boolean} shouldShowBytes Should the component show the bytes.
 * @property {Number} totalBytes Total number of bytes in the download.
 */

/**
 * Renders a `FileListItemSizeProgress` component
 * @param {FileListItemSizeProgressProps} props
 *
 * @example <caption>Renders a `FileListItemSizeProgress` component</caption>
 * return (
 *   <FileListItemSizeProgress
 *     receivedBytes={receivedBytes}
 *     shouldShowBytes={shouldShowBytes}
 *     totalBytes={totalBytes}
 *   />
 * )
 */
const FileListItemSizeProgress = ({
  receivedBytes,
  shouldShowBytes,
  totalBytes
}) => {
  if (!shouldShowBytes) return null

  return (
    <div className={styles.statusInformationByteStats}>
      <FaDownload className={styles.statusInformationIcon} />
      {convertBytes(receivedBytes)}
      /
      {convertBytes(totalBytes)}
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
