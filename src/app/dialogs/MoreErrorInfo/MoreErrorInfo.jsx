import React, { useContext } from 'react'
import PropTypes from 'prop-types'
import {
  FaBan,
  FaFolderOpen,
  FaRedo
} from 'react-icons/fa'

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
        The links associated with the download
        were not able to be retrieved.
        Try initializing the download again to download your files.
      </div>
    )
  }

  return (
    <>
      <div className={styles.message}>
        <p>
          {`${numberErrors} ${pluralize('file', numberErrors)} ${numberErrors > 1 ? 'were' : 'was'} not able to be downloaded. `}
          {`If the problem persists, try initializing the download again to download your ${pluralize('file', numberErrors)}.`}
        </p>
      </div>
      <div className={styles.actions}>
        <p className={styles.emphasis}>
          What would you like to do with the unsuccessful downloads?
        </p>
        <Button
          className={styles.actionsButton}
          Icon={FaRedo}
          onClick={() => onRetryErroredDownloadItem({ downloadId })}
        >
          Retry
        </Button>
        <Button
          className={styles.actionsButton}
          Icon={FaBan}
          variant="danger"
          onClick={() => onCancelDownloadItem({ downloadId })}
        >
          Cancel
        </Button>
      </div>
      <Button
        className={styles.primaryButton}
        Icon={FaFolderOpen}
        fullWidth
        onClick={
          () => {
            setCurrentPage(PAGES.fileDownloads)
            setSelectedDownloadId(downloadId)
            onCloseMoreErrorInfoDialog()
          }
        }
      >
        View Download
      </Button>
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
