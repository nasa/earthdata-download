import React, { useContext } from 'react'
import PropTypes from 'prop-types'
import {
  FaBan,
  FaRedo
} from 'react-icons/fa'
import Button from '../../components/Button/Button'

import { ElectronApiContext } from '../../context/ElectronApiContext'
import useAppContext from '../../hooks/useAppContext'

import pluralize from '../../utils/pluralize'

import * as styles from './MoreErrorInfo.module.scss'

/**
 * @typedef {Object} MoreErrorInfoProps
 * @property {String} [downloadId] A string representing the id of a download.
 * @property {Number} [numberErrors] The number of errors associated with the Dialog.
 * @property {Function} [onCloseMoreErrorInfoDialog] A function which sets the dialog state.
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
  onCloseMoreErrorInfoDialog
}) => {
  const appContext = useAppContext()
  const { deleteAllToastsById } = appContext
  const {
    cancelErroredDownloadItem,
    retryErroredDownloadItem
  } = useContext(ElectronApiContext)

  const onCancelDownloadItem = ({ downloadId }) => {
    cancelErroredDownloadItem({ downloadId })
    onCloseMoreErrorInfoDialog(false)
    deleteAllToastsById(downloadId)
  }

  const onRetryErroredDownloadItem = ({ downloadId }) => {
    retryErroredDownloadItem({ downloadId })
    onCloseMoreErrorInfoDialog(false)
    deleteAllToastsById(downloadId)
  }

  return (
    <>
      <div className={styles.message}>
        {/* TODO EDD-27 link downloadId to the files view */}
        {`${numberErrors} ${pluralize('file', numberErrors)} failed to download in ${downloadId}.`}
      </div>
      <div className={styles.actions}>
        <Button
          className={styles.actionsButton}
          size="sm"
          Icon={FaRedo}
          variant="danger"
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
  numberErrors: null
}

MoreErrorInfo.propTypes = {
  downloadId: PropTypes.string,
  numberErrors: PropTypes.number,
  onCloseMoreErrorInfoDialog: PropTypes.func.isRequired
}

export default MoreErrorInfo
