import React, { useContext } from 'react'
import PropTypes from 'prop-types'
import { FaBan, FaRedo } from 'react-icons/fa'

import Button from '../../components/Button/Button'

import downloadStates from '../../constants/downloadStates'
import { PAGES } from '../../constants/pages'
import { ElectronApiContext } from '../../context/ElectronApiContext'
import useAppContext from '../../hooks/useAppContext'

import pluralize from '../../utils/pluralize'

import * as styles from './MoreErrorInfo.module.scss'

/**
 * @typedef {Object} MoreErrorInfoProps
 * @property {String} [downloadId] A string representing the id of a download.
 * @property {Number} [numberErrors] The number of errors associated with the Dialog.
 * @property {String} state The state of the download.
 * @property {Function} setCurrentPage A function which sets the active page.
 * @property {Function} setSelectedDownloadId A function to set the selectedDownloadId.
 * @property {Function} onCloseMoreErrorInfoDialog A function which sets the dialog state.
 */
/**
 * Renders a `MoreErrorInfo` dialog.
 * @param {MoreErrorInfoProps} props
 *
 * @example <caption>Render a MoreErrorInfo dialog.</caption>
 *
 * const [downloadId, setDownloadId] = useState(null)
 * const [numberErrors, setNumberErrors] = useState(null)
 * const [moreErrorInfoIsOpen, setMoreErrorInfoIsOpen] = useState(false)
 *
 * return (
 *   <Dialog {...dialogProps}>
 *     <MoreErrorInfo
 *       downloadId={downloadId}
 *       numberErrors={numberErrors}
 *       onCloseMoreErrorInfoDialog={}
 *     />
 *   </MoreErrorInfo>
 * )
 */
const MoreErrorInfo = ({
  downloadId,
  numberErrors,
  state,
  setCurrentPage,
  setSelectedDownloadId,
  onCloseMoreErrorInfoDialog
}) => {
  const appContext = useAppContext()
  const { deleteAllToastsById } = appContext
  const {
    cancelErroredDownloadItem,
    retryErroredDownloadItem
  } = useContext(ElectronApiContext)

  const onCancelDownloadItem = ({ downloadId: cancelledDownloadId }) => {
    cancelErroredDownloadItem({ downloadId: cancelledDownloadId })
    onCloseMoreErrorInfoDialog(false)
    deleteAllToastsById(cancelledDownloadId)
  }

  const onRetryErroredDownloadItem = ({ downloadId: retryDownloadId }) => {
    retryErroredDownloadItem({ downloadId: retryDownloadId })
    onCloseMoreErrorInfoDialog(false)
    deleteAllToastsById(retryDownloadId)
  }

  if (state === downloadStates.errorFetchingLinks) {
    return (
      <div className={styles.message}>
        This download failed to find download links.
        Try creating a new download to download your files.
      </div>
    )
  }

  return (
    <>
      <div className={styles.message}>
        {`${numberErrors} ${pluralize('file', numberErrors)}`}
        {' '}
        failed to download in
        {' '}
        <Button
          size="sm"
          onClick={
            () => {
              setCurrentPage(PAGES.fileDownloads)
              setSelectedDownloadId(downloadId)
              onCloseMoreErrorInfoDialog()
            }
          }
        >
          {downloadId}
        </Button>
      </div>
      <div className={styles.actions}>
        <Button
          className={styles.actionsButton}
          size="sm"
          Icon={FaRedo}
          onClick={() => onRetryErroredDownloadItem({ downloadId })}
        >
          Retry Failed Files
        </Button>
        <Button
          className={styles.actionsButton}
          size="sm"
          Icon={FaBan}
          variant="danger"
          onClick={() => onCancelDownloadItem({ downloadId })}
        >
          Cancel Failed Files
        </Button>
      </div>
    </>
  )
}

MoreErrorInfo.defaultProps = {
  downloadId: null,
  numberErrors: null,
  state: null
}

MoreErrorInfo.propTypes = {
  downloadId: PropTypes.string,
  numberErrors: PropTypes.number,
  state: PropTypes.string,
  onCloseMoreErrorInfoDialog: PropTypes.func.isRequired,
  setCurrentPage: PropTypes.func.isRequired,
  setSelectedDownloadId: PropTypes.func.isRequired
}

export default MoreErrorInfo
