import React, { useState } from 'react'
import PropTypes from 'prop-types'
import { FaBan, FaDownload, FaFolder } from 'react-icons/fa'
import { VisuallyHidden } from '@radix-ui/react-visually-hidden'

import Button from '../Button/Button'
import Checkbox from '../Checkbox/Checkbox'

import * as styles from './InitializeDownload.module.scss'

// ipcRenderer is setup in preload.js and functions are exposed within `window.electronAPI`
const { electronAPI } = window

const InitializeDownload = ({
  downloadId,
  downloadLocation,
  useDefaultLocation,
  onCloseChooseLocationModal,
  setDownloadId
}) => {
  const [makeDefaultDownloadLocation, setMakeDefaultDownloadLocation] = useState(true)

  // Send a message to the main process to show the open dialog
  const onChooseDownloadLocation = () => {
    electronAPI.chooseDownloadLocation()
  }

  // Send a message to the main process to begin the download
  const handleBeginDownload = () => {
    electronAPI.beginDownload({
      downloadId,
      downloadLocation,
      makeDefaultDownloadLocation
    })

    setDownloadId(null)
    onCloseChooseLocationModal()
  }

  return (
    <>
      <div>
        <p style={{ display: 'none' }}>
          Download ID:
          {' '}
          {downloadId}
        </p>
      </div>
      {
        useDefaultLocation ? (
          <span>Download will use the default download location and begin downloading</span>
        ) : (
          <>
            <div className={styles.location}>
              <span className={styles.downloadLocationLabel}>Download files to:</span>
              <button
                className={styles.downloadLocation}
                type="button"
                onClick={onChooseDownloadLocation}
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
                onClick={() => {
                  // TODO Do we need to do any other cleanup with the download id here?
                  // TODO Can we add an undo functionality?
                  onCloseChooseLocationModal()
                }}
              >
                Cancel
              </Button>
              <Button
                className={styles.actions}
                size="lg"
                Icon={FaDownload}
                variant="success"
                onClick={handleBeginDownload}
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
  useDefaultLocation: PropTypes.bool.isRequired,
  onCloseChooseLocationModal: PropTypes.func.isRequired,
  setDownloadId: PropTypes.func.isRequired
}

export default InitializeDownload
