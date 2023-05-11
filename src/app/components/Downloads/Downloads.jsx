import React, { useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import { FaDownload, FaHistory, FaSearch } from 'react-icons/fa'

import InitializeDownload from '../InitializeDownload/InitializeDownload'

import Button from '../Button/Button'
import Dialog from '../Dialog/Dialog'
import ListPage from '../ListPage/ListPage'

import { PAGES } from '../../constants/pages'

import * as styles from './Downloads.module.scss'

// ipcRenderer is setup in preload.js and functions are exposed within `window.electronAPI`
// ?? Should we only call this in App.jsx and pass it down as a prop?
const { electronAPI } = window

/**
 * Renders the `Downloads` page
 */
const Downloads = ({
  setCurrentPage
}) => {
  const [downloadId, setDownloadId] = useState(null)
  const [downloadLocation, setDownloadLocation] = useState(null)
  const [useDefaultLocation, setUseDefaultLocation] = useState(false)
  const [chooseDownloadLocationIsOpen, setChooseDownloadLocationIsOpen] = useState(false)

  // When a new downloadLocation has been selected from the main process, update the state
  const onSetDownloadLocation = (event, info) => {
    const { downloadLocation: newDownloadLocation } = info
    setDownloadLocation(newDownloadLocation)
  }

  // When a download needs to be initialized (show the starting modal, or start the download)
  const onInitializeDownload = (event, info) => {
    const {
      downloadId: newDownloadId,
      downloadLocation: newDownloadLocation,
      shouldUseDefaultLocation
    } = info

    setDownloadId(newDownloadId)
    setDownloadLocation(newDownloadLocation)
    setUseDefaultLocation(shouldUseDefaultLocation)
  }

  const onCloseChooseLocationModal = () => {
    setChooseDownloadLocationIsOpen(false)
  }

  // Setup event listeners
  useEffect(() => {
    electronAPI.setDownloadLocation(true, onSetDownloadLocation)
    electronAPI.initializeDownload(true, onInitializeDownload)

    return () => {
      electronAPI.setDownloadLocation(false, onSetDownloadLocation)
      electronAPI.initializeDownload(false, onInitializeDownload)
    }
  }, [])

  // Open the modal when there is no default location set and a download id exists
  useEffect(() => {
    if (!useDefaultLocation && downloadId) setChooseDownloadLocationIsOpen(true)
  }, [useDefaultLocation, downloadId])

  return (
    <>
      <Dialog
        open={chooseDownloadLocationIsOpen}
        setOpen={setChooseDownloadLocationIsOpen}
        showTitle
        title="Choose a download location"
        TitleIcon={FaDownload}
      >
        <InitializeDownload
          downloadId={downloadId}
          downloadLocation={downloadLocation}
          useDefaultLocation={useDefaultLocation}
          setDownloadId={setDownloadId}
          onCloseChooseLocationModal={onCloseChooseLocationModal}
        />
      </Dialog>
      <ListPage
        actions={(
          <>
            <Button
              className={styles.button}
              size="lg"
              Icon={FaSearch}
              href="https://search.earthdata.nasa.gov/"
              target="_blank"
              rel="noreferrer"
            >
              Find data in Earthdata Search
            </Button>
            <Button
              className={styles.button}
              size="lg"
              Icon={FaHistory}
              onClick={() => setCurrentPage(PAGES.downloadHistory)}
            >
              View Download History
            </Button>
          </>
        )}
        emptyMessage="No downloads in progress"
        Icon={FaDownload}
        items={[]}
      />
    </>
  )
}

Downloads.propTypes = {
  setCurrentPage: PropTypes.func.isRequired
}

export default Downloads
