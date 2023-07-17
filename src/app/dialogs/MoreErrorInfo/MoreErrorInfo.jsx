import React, { useContext, useState } from 'react'
import PropTypes from 'prop-types'
import {
  FaAngleDown,
  FaAngleUp,
  FaBan,
  FaRedo
} from 'react-icons/fa'
import Button from '../../components/Button/Button'

import * as styles from './MoreErrorInfo.module.scss'
import { ElectronApiContext } from '../../context/ElectronApiContext'

/**
 * @typedef {Object} MoreErrorInfoProps
 * @property {String} downloadId A string representing the id of a download.
 * @property {Object} collectionErrorInfo An object containing information about the errored file(s).
 * @property {String} collectionErrorInfo.url An string representing the download URL of a file.
 */
/**
 * Renders a `MoreErrorInfo` dialog.
 * @param {MoreErrorInfoProps} props
 *
 * @example <caption>Render a MoreErrorInfo dialog.</caption>
 *
 *
 * return (
 *   <Dialog {...dialogProps}>
 *     <MoreErrorInfo
 *       collectionErrorInfo={collectionErrorInfo}
 *       downloadId={downloadId}
 *     />
 *   </MoreErrorInfo>
 * )
 */
const MoreErrorInfo = ({
  downloadId
}) => {
  const {
    cancelErroredDownloadItem,
    retryDownloadItem
  } = useContext(ElectronApiContext)

  const onCancelDownloadItem = ({ downloadId }) => {
    cancelErroredDownloadItem({ downloadId })
  }

  const onRetryDownloadItem = ({ downloadId }) => {
    retryDownloadItem({ downloadId })
  }

  return (
    <>
      <div className={styles.message}>
        {`An error occurred while downloading files to ${downloadId}`}
      </div>
      {'\n'}
      <Button
        className={styles.button}
        size="sm"
        Icon={FaRedo}
        variant="danger"
        onClick={() => onRetryDownloadItem({ downloadId })}
      >
        Retry Downloading Files
      </Button>
      <Button
        className={styles.button}
        size="sm"
        Icon={FaBan}
        variant="danger"
        onClick={() => onCancelDownloadItem({ downloadId })}
      >
        Cancel Downloading Files
      </Button>
      <div />
    </>
  )
}

MoreErrorInfo.propTypes = {
  downloadId: PropTypes.string.isRequired
}

export default MoreErrorInfo
