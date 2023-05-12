import React, { useContext, useState } from 'react'
import PropTypes from 'prop-types'
import { FaBan, FaDownload, FaFolder } from 'react-icons/fa'
import { VisuallyHidden } from '@radix-ui/react-visually-hidden'
import MiddleEllipsis from 'react-middle-ellipsis'

import Button from '../../components/Button/Button'
import Checkbox from '../../components/Checkbox/Checkbox'

import { ElectronApiContext } from '../../context/ElectronApiContext'

import * as styles from './InitializeDownload.module.scss'
import Tooltip from '../../components/Tooltip/Tooltip'

/**
 * @typedef {Object} InitializeDownloadProps
 * @property {String} downloadId A string representing the id of a download.
 * @property {String} downloadLocation A string representing the id of a download
 * @property {Boolean} useDefaultLocation A boolean flag which indicates whether a default download location should be used.
 * @property {Function} onCloseChooseLocationModal A function which sets the dialog state.
 */

/**
 * Renders a `InitializeDownload` dialog.
 * @param {InitializeDownloadProps} props
 *
 * @example <caption>Render a InitializeDownload dialog.</caption>
 *
 * const [downloadId, setDownloadId] = useState(null)
 * const [downloadLocation, setDownloadLocation] = useState(null)
 * const [useDefaultLocation, setUseDefaultLocation] = useState(false)
 * const [chooseDownloadLocationIsOpen, setChooseDownloadLocationIsOpen] = useState(false)
 *
 *
 * return (
 *   <Dialog {...dialogProps}>
 *     <InitializeDownload
 *       downloadId={downloadId}
 *       downloadLocation={downloadLocation}
 *       useDefaultLocation={useDefaultLocation}
 *       onCloseChooseLocationModal={() => setChooseDownloadLocationIsOpen(false)}
 *     />
 *   </Dialog>
 * )
 */
const InitializeDownload = ({
  downloadId,
  downloadLocation,
  onCloseChooseLocationModal,
  setDownloadId
}) => {
  const { beginDownload, chooseDownloadLocation } = useContext(ElectronApiContext)
  const [makeDefaultDownloadLocation, setMakeDefaultDownloadLocation] = useState(true)

  // Send a message to the main process to show the open dialog
  const onChooseDownloadLocation = () => {
    chooseDownloadLocation()
  }

  // Send a message to the main process to begin the download
  const onBeginDownload = () => {
    beginDownload({
      downloadId,
      downloadLocation,
      makeDefaultDownloadLocation
    })

    setDownloadId(null)
    onCloseChooseLocationModal()
  }

  return (
    <>
      <div className={styles.location}>
        <span className={styles.downloadLocationLabel}>Download files to:</span>
        <Tooltip
          content="Change the download location for your files"
          additionalContent={(
            <span className={styles.tooltipFilePath}>
              {`${downloadLocation}`}
            </span>
          )}
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
              <VisuallyHidden>
                <span>{`${downloadLocation}`}</span>
              </VisuallyHidden>
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
          onChange={(checked) => {
            setMakeDefaultDownloadLocation(checked)
          }}
        />
      </div>
      <div>
        <Button
          className={styles.actions}
          size="lg"
          variant="danger"
          Icon={FaBan}
          onClick={
            // TODO Do we need to do any other cleanup with the download id here?
            // TODO Can we add an undo functionality?
            onCloseChooseLocationModal
          }
        >
          Cancel
        </Button>
        <Button
          className={styles.actions}
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
        Note: Each dataset will be downloaded to its own folder within your chosen location.
      </p>
    </>
  )
}

InitializeDownload.defaultProps = {
  downloadId: null,
  downloadLocation: null
}

InitializeDownload.propTypes = {
  downloadId: PropTypes.string,
  downloadLocation: PropTypes.string,
  onCloseChooseLocationModal: PropTypes.func.isRequired,
  setDownloadId: PropTypes.func.isRequired
}

export default InitializeDownload
