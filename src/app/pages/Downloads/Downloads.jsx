import React, { useContext, useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import {
  FaBan,
  FaCheckCircle,
  FaClipboard,
  FaDownload,
  FaFolderOpen,
  FaPause,
  FaPlay,
  FaSearch,
  FaSpinner
} from 'react-icons/fa'
import classNames from 'classnames'

import downloadStates from '../../constants/downloadStates'
import humanizedDownloadStates from '../../constants/humanizedDownloadStates'

import createVariantClassName from '../../utils/createVariantName'

import { ElectronApiContext } from '../../context/ElectronApiContext'
import InitializeDownload from '../../dialogs/InitializeDownload/InitializeDownload'
import Button from '../../components/Button/Button'
import Dialog from '../../components/Dialog/Dialog'
import ListPage from '../../components/ListPage/ListPage'
import DownloadItem from '../../components/DownloadItem/DownloadItem'

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
    cancelDownloadItem,
    openDownloadFolder,
    copyDownloadPath
  } = useContext(ElectronApiContext)
  const [downloadIds, setDownloadIds] = useState(null)
  const [selectedDownloadLocation, setSelectedDownloadLocation] = useState(null)
  const [useDefaultLocation, setUseDefaultLocation] = useState(false)
  const [chooseDownloadLocationIsOpen, setChooseDownloadLocationIsOpen] = useState(false)
  const [runningDownloads, setRunningDownloads] = useState([])
  const [allDownloadsPaused, setAllDownloadsPaused] = useState(false)
  const [allDownloadsCompleted, setAllDownloadsCompleted] = useState(false)
  const [hasActiveDownload, setHasActiveDownload] = useState(false)
  const [hasPausedDownload, setHasPausedDownload] = useState(false)
  const [totalDownloadFiles, setTotalDownloadFiles] = useState(0)
  const [totalCompletedFiles, setTotalCompletedFiles] = useState(0)
  const [
    derivedStateFromDownloads,
    setDerivedStateFromDownloads
  ] = useState(downloadStates.completed)

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

  const onOpenDownloadFolder = (downloadId) => {
    openDownloadFolder({ downloadId })
  }

  const onCopyDownloadPath = (downloadId) => {
    copyDownloadPath({ downloadId })
  }

  const onResumeDownloadItem = (downloadId) => {
    resumeDownloadItem({ downloadId })
  }

  const onCancelDownloadItem = (downloadId) => {
    cancelDownloadItem({ downloadId })
  }

  const onReportProgress = (event, info) => {
    const { progress } = info
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

  useEffect(() => {
    // TODO Consider improving how we are determining these states. For downloads with
    // many files, this method may not be ideal.
    setAllDownloadsPaused(runningDownloads.length && runningDownloads.every(
      ({ state }) => (state === downloadStates.paused || state === downloadStates.completed)
    ))
    setAllDownloadsCompleted(runningDownloads.length && runningDownloads.every(
      ({ state }) => state === downloadStates.completed
    ))
    setHasActiveDownload(runningDownloads.length && runningDownloads.some(
      ({ state }) => state === downloadStates.active
    ))
    setHasPausedDownload(runningDownloads.length && runningDownloads.some(
      ({ state }) => state === downloadStates.paused
    ))
    setTotalDownloadFiles(runningDownloads.length && runningDownloads.reduce(
      (acc, cur) => cur.progress.totalFiles + acc,
      0
    ))
    setTotalCompletedFiles(runningDownloads.length && runningDownloads.reduce(
      (acc, cur) => cur.progress.finishedFiles + acc,
      0
    ))
  }, [runningDownloads])

  useEffect(() => {
    if (allDownloadsCompleted) {
      setDerivedStateFromDownloads(downloadStates.completed)
      return
    }

    if (allDownloadsPaused) {
      setDerivedStateFromDownloads(downloadStates.paused)
      return
    }

    if (hasActiveDownload) {
      setDerivedStateFromDownloads(downloadStates.active)
      return
    }

    if (hasPausedDownload) {
      setDerivedStateFromDownloads(downloadStates.paused)
    }
  }, [runningDownloads])

  // Create the downloadItems array from the runningDownloads reported from the main process
  const downloadItems = runningDownloads.map((runningDownload) => {
    const {
      downloadId,
      downloadName,
      progress,
      state
    } = runningDownload
    const { finishedFiles } = progress
    const shouldShowPause = [
      downloadStates.active
    ].includes(state)
    const shouldShowResume = [
      downloadStates.paused,
      downloadStates.interrupted
    ].includes(state)
    const shouldShowCancel = [
      downloadStates.paused,
      downloadStates.active,
      downloadStates.error,
      downloadStates.interrupted
    ].includes(state)
    const shouldDisableOpenFolder = finishedFiles === 0
    const isComplete = state === downloadStates.completed

    const actionsList = [
      [
        {
          label: 'Pause Download',
          isActive: shouldShowPause,
          isPrimary: !isComplete,
          callback: () => onPauseDownloadItem(downloadId, downloadName),
          icon: FaPause
        },
        {
          label: 'Resume Download',
          isActive: shouldShowResume,
          isPrimary: !isComplete,
          callback: () => onResumeDownloadItem(downloadId, downloadName),
          icon: FaPlay
        },
        {
          label: 'Cancel Download',
          isActive: shouldShowCancel,
          isPrimary: !isComplete,
          variant: 'danger',
          callback: () => onCancelDownloadItem(downloadId, downloadName),
          icon: FaBan
        }
      ],
      [
        {
          label: 'Open Folder',
          isActive: !shouldDisableOpenFolder,
          isPrimary: isComplete,
          callback: () => onOpenDownloadFolder(downloadId),
          icon: FaFolderOpen,
          disabled: shouldDisableOpenFolder
        },
        {
          label: 'Copy Folder Path',
          isActive: true,
          isPrimary: isComplete,
          callback: () => onCopyDownloadPath(downloadId),
          icon: FaClipboard
        }
      ]
    ]

    return (
      <DownloadItem
        key={downloadId}
        downloadName={downloadName}
        progress={progress}
        state={state}
        actionsList={actionsList}
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
              className={styles.emptyActionButton}
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
        header={
          !!runningDownloads.length && (
            <div
              className={
                classNames([
                  styles.listHeader,
                  styles[createVariantClassName(derivedStateFromDownloads)]
                ])
              }
            >
              <div className={styles.listHeaderPrimary}>
                {
                  derivedStateFromDownloads === downloadStates.active && (
                    <FaSpinner className={styles.derivedStatusIcon} />
                  )
                }
                {
                  derivedStateFromDownloads === downloadStates.paused && (
                    <FaPause className={styles.derivedStatusIcon} />
                  )
                }
                {
                  derivedStateFromDownloads === downloadStates.completed && (
                    <FaCheckCircle className={styles.derivedStatusIcon} />
                  )
                }
                <span className={styles.derivedStatus}>
                  {
                    derivedStateFromDownloads === downloadStates.active && (
                      humanizedDownloadStates[downloadStates.active]
                    )
                  }
                  {
                    derivedStateFromDownloads === downloadStates.paused && (
                      humanizedDownloadStates[downloadStates.paused]
                    )
                  }
                  {
                    derivedStateFromDownloads === downloadStates.completed && (
                      humanizedDownloadStates[downloadStates.completed]
                    )
                  }
                </span>
                <span className={styles.humanizedStatus}>
                  {totalCompletedFiles}
                  {' '}
                  of
                  {' '}
                  {totalDownloadFiles}
                  {' '}
                  files done
                </span>
              </div>
              <div className={styles.listHeaderSecondary}>
                {
                  !allDownloadsCompleted
                    ? (
                      <>
                        {
                          !allDownloadsPaused
                            ? (
                              <Button
                                className={styles.headerButton}
                                size="sm"
                                Icon={FaPause}
                                onClick={() => onPauseDownloadItem()}
                              >
                                Pause All
                              </Button>
                            )
                            : (
                              <Button
                                className={styles.headerButton}
                                size="sm"
                                Icon={FaPlay}
                                onClick={() => onResumeDownloadItem()}
                              >
                                Resume All
                              </Button>
                            )
                        }
                        <Button
                          className={styles.button}
                          size="sm"
                          Icon={FaBan}
                          variant="danger"
                          onClick={() => onCancelDownloadItem()}
                        >
                          Cancel All
                        </Button>
                      </>
                    )
                    : (
                      <Button
                        className={styles.button}
                        size="sm"
                        Icon={FaBan}
                        variant="danger"
                        onClick={() => onCancelDownloadItem()}
                      >
                        Clear Downloads
                      </Button>
                    )
                  }
              </div>
            </div>
          )
        }
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
