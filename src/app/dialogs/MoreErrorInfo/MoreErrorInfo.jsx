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
 * @property {String} collectionErrorInfo.filename A string representing the name of a file.
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
  downloadId,
  collectionErrorInfo
}) => {
  const [viewErrors, setViewErrors] = useState(false)

  const urls = []
  const fileNames = []

  collectionErrorInfo.forEach((item) => {
    const {
      filename,
      url
    } = item

    urls.push(url)
    fileNames.push(filename)
  })
  const errorMessage = 'Server responded with an error while downloading files. If the errors persist, please contact the data provider.'

  const {
    cancelDownloadItem,
    retryDownloadItem
  } = useContext(ElectronApiContext)

  const onCancelDownloadItem = (downloadId, filename) => {
    cancelDownloadItem({ downloadId, filename })
  }

  const onRetryDownloadItem = (downloadId, filename) => {
    retryDownloadItem({ downloadId, filename })
  }

  return (
    <>
      <div className={styles.message}>
        {errorMessage}
      </div>
      <Button
        className={styles.button}
        size="sm"
        Icon={viewErrors ? FaAngleUp : FaAngleDown}
        onClick={() => setViewErrors(!viewErrors)}
      >
        View Errored File Details
      </Button>
      {'\n'}
      <ul
        className={styles.list}
      >
        {
          viewErrors && (Array.from({ length: urls.length }).map((_, index) => (
            <div className={styles.item} key={fileNames[index]}>
              <b> File:&nbsp;</b>
              {urls[index]}
              <br />
              <Button
                className={styles.button}
                size="sm"
                Icon={FaRedo}
                variant="danger"
                onClick={() => onRetryDownloadItem(downloadId, fileNames[index])}
              >
                Retry
              </Button>
              <Button
                className={styles.button}
                size="sm"
                Icon={FaBan}
                variant="danger"
                onClick={() => onCancelDownloadItem(downloadId, fileNames[index])}
              >
                Cancel
              </Button>
              <div />
            </div>
          )))
        }
      </ul>

      <Button
        className={styles.button}
        size="sm"
        Icon={FaRedo}
        variant="danger"
        onClick={() => onRetryDownloadItem(downloadId)}
      >
        Retry All Errored
      </Button>
      <Button
        className={styles.button}
        size="sm"
        Icon={FaBan}
        variant="danger"
        onClick={() => onCancelDownloadItem(downloadId)}
      >
        Cancel All Errored
      </Button>
      <div />
    </>
  )
}

MoreErrorInfo.propTypes = {
  downloadId: PropTypes.string.isRequired,
  collectionErrorInfo: PropTypes.arrayOf(PropTypes.shape({
    filename: PropTypes.string.isRequired,
    url: PropTypes.string.isRequired
  })).isRequired
}

export default MoreErrorInfo
