import React, { useContext, useState } from 'react'
import PropTypes from 'prop-types'
import {
  FaBan,
  FaDownload,
  FaFolder
} from 'react-icons/fa'
import * as VisuallyHidden from '@radix-ui/react-visually-hidden'
import MiddleEllipsis from 'react-middle-ellipsis'

import Button from '../../components/Button/Button'
import Checkbox from '../../components/Checkbox/Checkbox'

import { ElectronApiContext } from '../../context/ElectronApiContext'

import * as styles from './InitializeDownload.module.scss'
import Tooltip from '../../components/Tooltip/Tooltip'

/**
 * @typedef {Object} InitializeDownloadProps
 * @property {String} downloadId A string representing the id of a download.
 * @property {String} downloadLocation A string representing the absolute path of a download
 * @property {Boolean} useDefaultLocation A boolean flag which indicates whether a default download location should be used.
 * @property {Function} onCloseChooseLocationDialog A function which sets the dialog state.
 */

/**
 * Renders a `InitializeDownload` dialog.
 * @param {InitializeDownloadProps} props
 *
 * @example <caption>Render a InitializeDownload dialog.</caption>
 *
 * const [downloadIds, setDownloadIds] = useState(null)
 * const [downloadLocation, setDownloadLocation] = useState(null)
 * const [useDefaultLocation, setUseDefaultLocation] = useState(false)
 * const [chooseDownloadLocationIsOpen, setChooseDownloadLocationIsOpen] = useState(false)
 *
 *
 * return (
 *   <Dialog {...dialogProps}>
 *     <InitializeDownload
 *       downloadIds={downloadIds}
 *       downloadLocation={downloadLocation}
 *       useDefaultLocation={useDefaultLocation}
 *       onCloseChooseLocationDialog={() => setChooseDownloadLocationIsOpen(false)}
 *     />
 *   </Dialog>
 * )
 */
const InitializeDownload = ({
  downloadIds,
  downloadLocation,
  onCloseChooseLocationDialog,
  setDownloadIds
}) => {
  const {
    beginDownload,
    cancelDownloadItem,
    chooseDownloadLocation
  } = useContext(ElectronApiContext)
  const [makeDefaultDownloadLocation, setMakeDefaultDownloadLocation] = useState(true)

  // Send a message to the main process to show the open dialog
  const onChooseDownloadLocation = () => {
    chooseDownloadLocation()
  }

  // Send a message to the main process to begin the download
  const onBeginDownload = () => {
    beginDownload({
      downloadIds,
      downloadLocation,
      makeDefaultDownloadLocation
    })

    setDownloadIds(null)
    onCloseChooseLocationDialog()
  }

  const onCancel = () => {
    // TODO Can we add an undo functionality?
    downloadIds.forEach((downloadId) => cancelDownloadItem({ downloadId }))
    onCloseChooseLocationDialog()
  }

  return (
    <>
      <div className={styles.location}>
        <span className={styles.downloadLocationLabel}>Download files to</span>
        <Tooltip
          content="Change the selected download location"
          delayDuration={300}
        >
          <button
            className={styles.downloadLocationButton}
            type="button"
            onClick={onChooseDownloadLocation}
            data-testid="initialize-download-location"
            aria-label="Choose another folder"
          >
            <span className={styles.downloadLocationWrapper}>
              <FaFolder className={styles.downloadLocationIcon} />
              <VisuallyHidden.Root>
                <span>{downloadLocation}</span>
              </VisuallyHidden.Root>
              <MiddleEllipsis key={downloadLocation}>
                <span
                  className={styles.downloadLocationText}
                  aria-hidden="true"
                >
                  {downloadLocation}
                </span>
              </MiddleEllipsis>
            </span>
          </button>
        </Tooltip>
      </div>
      <div className={styles.options}>
        <Checkbox
          defaultChecked
          id="defaultDownloadLocation"
          label="Set this as my default download location and do not ask again next time"
          labelNote="The default download location can be changed in the “Settings” menu"
          checked={makeDefaultDownloadLocation}
          onChange={
            (checked) => {
              setMakeDefaultDownloadLocation(checked)
            }
          }
        />
      </div>
      <div className={styles.actions}>
        <Button
          className={styles.actionsButton}
          size="lg"
          variant="danger"
          Icon={FaBan}
          onClick={onCancel}
          dataTestId="initialize-download-cancel-download"
        >
          Cancel
        </Button>
        <Button
          className={styles.actionsButton}
          size="lg"
          Icon={FaDownload}
          variant="success"
          onClick={onBeginDownload}
          dataTestId="initialize-download-begin-download"
        >
          Begin download
        </Button>
      </div>
      <p className={styles.note}>
        Note: Each dataset will be downloaded to a separate folder within the chosen location.
      </p>
    </>
  )
}

InitializeDownload.defaultProps = {
  downloadIds: null,
  downloadLocation: null
}

InitializeDownload.propTypes = {
  downloadIds: PropTypes.arrayOf(PropTypes.string),
  downloadLocation: PropTypes.string,
  onCloseChooseLocationDialog: PropTypes.func.isRequired,
  setDownloadIds: PropTypes.func.isRequired
}

export default InitializeDownload
