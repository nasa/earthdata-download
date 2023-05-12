import React, { useContext, useState } from 'react'
import PropTypes from 'prop-types'
import { FaBan, FaDownload, FaFolder } from 'react-icons/fa'
import { VisuallyHidden } from '@radix-ui/react-visually-hidden'

import Button from '../Button/Button'
import Checkbox from '../Checkbox/Checkbox'

import { ElectronApiContext } from '../../context/ElectronApiContext'

import * as styles from './InitializeDownload.module.scss'

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
  const handleBeginDownload = () => {
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
        <button
          className={styles.downloadLocation}
          type="button"
          onClick={onChooseDownloadLocation}
          data-testid="initialize-download-location"
        >
          <FaFolder className={styles.downloadLocationIcon} />
          <span className={styles.downloadLocationText}>{`~${downloadLocation}`}</span>
        </button>
        <VisuallyHidden>
          <Button
            className={styles.changeLocationButton}
            Icon={FaFolder}
            onClick={onChooseDownloadLocation}
          >
            Choose another folder
          </Button>
        </VisuallyHidden>
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
          onClick={handleBeginDownload}
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
