import React, { useContext, useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import {
  FaBan,
  FaCheckCircle,
  FaClipboard,
  FaDownload,
  FaExclamationCircle,
  FaFolderOpen,
  FaInfoCircle,
  FaPause,
  FaPlay,
  FaRedo,
  FaSearch,
  FaSignInAlt,
  FaSpinner
} from 'react-icons/fa'
import classNames from 'classnames'

import downloadStates from '../../constants/downloadStates'
import getHumanizedDownloadStates from '../../constants/humanizedDownloadStates'

import createVariantClassName from '../../utils/createVariantName'

import { ElectronApiContext } from '../../context/ElectronApiContext'
import InitializeDownload from '../../dialogs/InitializeDownload/InitializeDownload'
import MoreErrorInfo from '../../dialogs/MoreErrorInfo/MoreErrorInfo'
import Button from '../../components/Button/Button'
import Dialog from '../../components/Dialog/Dialog'
import ListPage from '../../components/ListPage/ListPage'
import DownloadItem from '../../components/DownloadItem/DownloadItem'
import Toast from '../../components/Toast/Toast'

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
  hasActiveDownload,
  setHasActiveDownload
}) => {
  const {
    beginDownload,
    cancelDownloadItem,
    copyDownloadPath,
    initializeDownload,
    openDownloadFolder,
    pauseDownloadItem,
    reportProgress,
    retryDownloadItem,
    resumeDownloadItem,
    sendToLogin,
    setDownloadLocation
  } = useContext(ElectronApiContext)

  const [downloadIds, setDownloadIds] = useState(null)
  const [selectedDownloadLocation, setSelectedDownloadLocation] = useState(null)
  const [useDefaultLocation, setUseDefaultLocation] = useState(false)
  const [chooseDownloadLocationIsOpen, setChooseDownloadLocationIsOpen] = useState(false)
  const [moreErrorInfoIsOpen, setMoreErrorInfoIsOpen] = useState()
  const [runningDownloads, setRunningDownloads] = useState([])
  const [allDownloadsPaused, setAllDownloadsPaused] = useState(false)
  const [allDownloadsCompleted, setAllDownloadsCompleted] = useState(false)
  const [allDownloadsError, setAllDownloadsError] = useState(false)
  const [hasPausedDownload, setHasPausedDownload] = useState(false)
  const [hasErrorDownload, setHasErrorDownload] = useState(false)
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
      // TODO this is calling beginDownload twice
      beginDownload({
        downloadIds: newDownloadIds,
        downloadLocation: newDownloadLocation,
        makeDefaultDownloadLocation: true
      })
    }
  }

  const onCloseChooseLocationModal = () => {
    setChooseDownloadLocationIsOpen(false)
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

  const onRetryDownloadItem = (downloadId) => {
    retryDownloadItem({ downloadId })
  }

  const onReportProgress = (event, info) => {
    const { progress, errorInfo } = info
    setRunningDownloads(progress, errorInfo)
  }

  // Setup event listeners
  useEffect(() => {
    setDownloadLocation(true, onSetDownloadLocation)
    initializeDownload(true, onInitializeDownload)
    reportProgress(true, onReportProgress)

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
    setAllDownloadsPaused(!!(runningDownloads.length && runningDownloads.every(
      ({ state }) => (state === downloadStates.paused || state === downloadStates.completed)
    )))
    setAllDownloadsCompleted(!!(runningDownloads.length && runningDownloads.every(
      ({ state }) => state === downloadStates.completed
    )))
    setAllDownloadsError((runningDownloads.length && runningDownloads.every(
      ({ state }) => state === downloadStates.error || state === downloadStates.completed
    )))
    setHasActiveDownload(!!(runningDownloads.length && runningDownloads.some(
      ({ state }) => state === downloadStates.active
    )))
    setHasPausedDownload(!!(runningDownloads.length && runningDownloads.some(
      ({ state }) => state === downloadStates.paused
    )))
    setHasErrorDownload((runningDownloads.length && runningDownloads.some(
      ({ numErrors }) => (numErrors > 0 && !hasPausedDownload)
    )))

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

    if (hasErrorDownload) {
      setDerivedStateFromDownloads(downloadStates.error)
    }
  }, [runningDownloads])

  // Create the array of error toasts from error info reported from the main process
  const errorToasts = runningDownloads.map((runningDownload) => {
    const {
      downloadId,
      errorInfo,
      numErrors
    } = runningDownload

    if (numErrors === 0) {
      return null
    }
    const errorMessage = `${errorInfo.length} error${errorInfo.length === 1 ? '' : 's'} occurred downloading `

    const action = (
      <Button
        className={styles.button}
        size="sm"
        Icon={FaInfoCircle}
        variant="danger"
        onClick={() => setMoreErrorInfoIsOpen(true)}
      >
        More Info
        <Dialog
          open={moreErrorInfoIsOpen}
          setOpen={setMoreErrorInfoIsOpen}
          showTitle
          title="An error occurred when downloading a file"
          TitleIcon={FaInfoCircle}
          closeButton
        >
          <MoreErrorInfo
            downloadId={downloadId}
            collectionErrorInfo={errorInfo}
          />
        </Dialog>
      </Button>
    )
    return (
      hasErrorDownload && (
        <Toast
          className={styles.toast}
          open={hasErrorDownload}
          closeButton
          key={downloadId}
          variant="foreground"
          action={action}
        >
          <div className={styles.errorMessage}>
            {errorMessage}
            <b>{downloadId}</b>
          </div>
        </Toast>
      )
    )
  })

  // Create the downloadItems array from the runningDownloads reported from the main process
  const downloadItems = runningDownloads.map((runningDownload) => {
    const {
      downloadId,
      downloadName,
      loadingMoreFiles,
      progress,
      state
    } = runningDownload

    const { finishedFiles } = progress

    const shouldShowPause = [
      downloadStates.pending,
      downloadStates.error,
      downloadStates.active
    ].includes(state)
    const shouldShowResume = [
      downloadStates.paused,
      downloadStates.error,
      downloadStates.interrupted
    ].includes(state)
    const shouldShowCancel = [
      downloadStates.pending,
      downloadStates.paused,
      downloadStates.active,
      downloadStates.error,
      downloadStates.interrupted,
      downloadStates.waitingForAuth
    ].includes(state)
    const shouldDisableOpenFolder = finishedFiles === 0
    const isComplete = state === downloadStates.completed
    const shouldShowError = state === downloadStates.error
    const shouldShowLogin = state === downloadStates.waitingForAuth

    const actionsList = [
      [
        {
          label: 'Log In with Earthdata Login',
          isActive: shouldShowLogin,
          isPrimary: shouldShowLogin,
          callback: () => sendToLogin({
            downloadId: downloadName,
            forceLogin: true
            // TODO EDD-13, might want to be able to send a fileId as well
            // fileId
          }),
          icon: FaSignInAlt
        },
        {
          label: 'Pause Download',
          isActive: shouldShowPause,
          isPrimary: !isComplete,
          callback: () => onPauseDownloadItem(downloadId, downloadName),
          icon: FaPause
        },
        {
          label: 'Resume Download',
          isActive: shouldShowResume && !shouldShowPause,
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
      ],
      [
        {
          label: 'Restart Download',
          isActive: true,
          isPrimary: false,
          callback: () => onRetryDownloadItem(downloadId),
          icon: FaInfoCircle
        },
        {
          label: 'View Error Info',
          isActive: shouldShowError,
          isPrimary: false,
          callback: () => setMoreErrorInfoIsOpen(true),
          icon: FaInfoCircle
        }
      ]
    ]

    return (
      <DownloadItem
        key={downloadId}
        downloadName={downloadName}
        loadingMoreFiles={loadingMoreFiles}
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
                {
                  derivedStateFromDownloads === downloadStates.error && (
                    <FaExclamationCircle className={styles.derivedStatusIcon} />
                  )
                }
                <span className={styles.derivedStatus}>
                  {
                    derivedStateFromDownloads === downloadStates.active && (
                      getHumanizedDownloadStates(downloadStates.active)
                    )
                  }
                  {
                    derivedStateFromDownloads === downloadStates.paused && (
                      getHumanizedDownloadStates(downloadStates.paused)
                    )
                  }
                  {
                    derivedStateFromDownloads === downloadStates.completed && (
                      getHumanizedDownloadStates(downloadStates.completed)
                    )
                  }
                  {
                    derivedStateFromDownloads === downloadStates.error && (
                      getHumanizedDownloadStates(downloadStates.error)
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
                  allDownloadsError && (
                    <Button
                      className={styles.button}
                      size="sm"
                      Icon={FaRedo}
                      variant="danger"
                      onClick={() => onRetryDownloadItem()}
                    >
                      Restart All
                    </Button>
                  )
                }
                {
                  !allDownloadsCompleted
                    ? (
                      <>
                        {
                          !allDownloadsError && (!allDownloadsPaused
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
                            ))
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
        errorToasts={errorToasts}
      />
    </>
  )
}
Downloads.propTypes = {
  hasActiveDownload: PropTypes.oneOfType([
    PropTypes.bool,
    PropTypes.number
  ]).isRequired,
  setHasActiveDownload: PropTypes.func.isRequired
}

export default Downloads
