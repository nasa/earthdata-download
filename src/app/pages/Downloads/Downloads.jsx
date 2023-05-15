import React, { useContext, useEffect, useState } from 'react'
import PropTypes from 'prop-types'
// eslint-disable-next-line no-unused-vars
import { FaDownload, FaHistory, FaSearch } from 'react-icons/fa'

import InitializeDownload from '../../dialogs/InitializeDownload/InitializeDownload'

import Button from '../../components/Button/Button'
import Dialog from '../../components/Dialog/Dialog'
import ListPage from '../../components/ListPage/ListPage'
import DownloadItem from '../../components/DownloadItem/DownloadItem'

// eslint-disable-next-line no-unused-vars
import { PAGES } from '../../constants/pages'

import { ElectronApiContext } from '../../context/ElectronApiContext'

import * as styles from './Downloads.module.scss'

/**
 * @typedef {Object} DownloadsProps
 * @property {Function} setCurrentPage A function which sets the active page.

/**
 * Renders a `Downloads` page.
 * @param {DownloadsProps} props
 *
 * @example <caption>Render a Downloads page.</caption>
 *
 * return (
 *   <Downloads
 *     setCurrentPage={setCurrentPage}
 *   />
 * )
 */
const Downloads = ({
  // eslint-disable-next-line no-unused-vars
  setCurrentPage
}) => {
  const {
    beginDownload,
    initializeDownload,
    setDownloadLocation,
    pauseDownloadItem,
    reportProgress,
    requestProgressReport,
    resumeDownloadItem,
    cancelDownloadItem
  } = useContext(ElectronApiContext)
  const [downloadIds, setDownloadIds] = useState(null)
  const [selectedDownloadLocation, setSelectedDownloadLocation] = useState(null)
  const [useDefaultLocation, setUseDefaultLocation] = useState(false)
  const [chooseDownloadLocationIsOpen, setChooseDownloadLocationIsOpen] = useState(false)
  const [runningDownloads, setRunningDownloads] = useState([])

  // When a new downloadLocation has been selected from the main process, update the state
  const onSetDownloadLocation = (event, info) => {
    const { downloadLocation: newDownloadLocation } = info
    setSelectedDownloadLocation(newDownloadLocation)
  }

  // When a download needs to be initialized (show the starting modal, or start the download)
  const onInitializeDownload = (event, info) => {
    const {
      downloadIds: newDownloadIds,
      downloadLocation: newDownloadLocation,
      shouldUseDefaultLocation
    } = info

    setDownloadIds(newDownloadIds)
    setSelectedDownloadLocation(newDownloadLocation)
    setUseDefaultLocation(shouldUseDefaultLocation)

    // If shouldUseDefaultLocation is true, start the download(s)
    if (shouldUseDefaultLocation) {
      beginDownload({
        downloadIds: newDownloadIds,
        downloadLocation: newDownloadLocation,
        makeDefaultDownloadLocation: true
      })

      // Ensure the main process is reporting progress updates
      requestProgressReport()
    }
  }

  const onCloseChooseLocationModal = () => {
    setChooseDownloadLocationIsOpen(false)

    // Ensure the main process is reporting progress updates
    requestProgressReport()
  }

  const onPauseDownloadItem = (downloadId) => {
    pauseDownloadItem({ downloadId })
  }

  const onResumeDownloadItem = (downloadId) => {
    resumeDownloadItem({ downloadId })
  }

  const onCancelDownloadItem = (downloadId) => {
    cancelDownloadItem({ downloadId })
  }

  const onReportProgress = (event, info) => {
    const { progress } = info
    // console.log('🚀 ~ file: Downloads.jsx:90 ~ onReportProgress ~ progress:', progress)
    setRunningDownloads(progress)
  }

  // Setup event listeners
  useEffect(() => {
    setDownloadLocation(true, onSetDownloadLocation)
    initializeDownload(true, onInitializeDownload)
    reportProgress(true, onReportProgress)

    requestProgressReport()

    return () => {
      setDownloadLocation(false, onSetDownloadLocation)
      initializeDownload(false, onInitializeDownload)
      reportProgress(false, onReportProgress)
    }
  }, [])

  // Open the modal when there is no default location set and a download id exists
  useEffect(() => {
    if (!useDefaultLocation && downloadIds) setChooseDownloadLocationIsOpen(true)
  }, [useDefaultLocation, downloadIds])

  // Create the downloadItems array from the runningDownloads reported from the main process
  const downloadItems = runningDownloads.map((runningDownload) => {
    const {
      downloadId,
      downloadName,
      progress,
      state
    } = runningDownload

    return (
      <DownloadItem
        key={downloadId}
        downloadId={downloadId}
        downloadName={downloadName}
        progress={progress}
        state={state}
        onPauseDownload={onPauseDownloadItem}
        onResumeDownload={onResumeDownloadItem}
        onCancelDownload={onCancelDownloadItem}
      />
    )
  })

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
          downloadIds={downloadIds}
          downloadLocation={selectedDownloadLocation}
          setDownloadIds={setDownloadIds}
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
            {/* Hiding nav buttons until EDD-18 */}
            {/* <Button
              className={styles.button}
              size="lg"
              Icon={FaHistory}
              onClick={() => setCurrentPage(PAGES.downloadHistory)}
            >
              View Download History
            </Button> */}
          </>
        )}
        emptyMessage="No downloads in progress"
        Icon={FaDownload}
        items={downloadItems}
      />
    </>
  )
}

Downloads.propTypes = {
  setCurrentPage: PropTypes.func.isRequired
}

export default Downloads
