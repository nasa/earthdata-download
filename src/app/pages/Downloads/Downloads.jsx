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
import pluralize from '../../utils/pluralize'

import { ElectronApiContext } from '../../context/ElectronApiContext'
import InitializeDownload from '../../dialogs/InitializeDownload/InitializeDownload'
import MoreErrorInfo from '../../dialogs/MoreErrorInfo/MoreErrorInfo'
import Button from '../../components/Button/Button'
import Dialog from '../../components/Dialog/Dialog'
import ListPage from '../../components/ListPage/ListPage'
import DownloadItem from '../../components/DownloadItem/DownloadItem'

import useAppContext from '../../hooks/useAppContext'

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
  const appContext = useAppContext()
  const {
    addToast,
    deleteAllToastsById
  } = appContext
  const {
    beginDownload,
    cancelDownloadItem,
    copyDownloadPath,
    initializeDownload,
    openDownloadFolder,
    pauseDownloadItem,
    reportProgress,
    restartDownload,
    resumeDownloadItem,
    retryErroredDownloadItem,
    sendToEula,
    sendToLogin,
    setDownloadLocation
  } = useContext(ElectronApiContext)

  const [downloadIds, setDownloadIds] = useState(null)
  const [selectedDownloadLocation, setSelectedDownloadLocation] = useState(null)
  const [useDefaultLocation, setUseDefaultLocation] = useState(false)
  const [chooseDownloadLocationIsOpen, setChooseDownloadLocationIsOpen] = useState(false)
  const [moreErrorInfoIsOpen, setMoreErrorInfoIsOpen] = useState()
  const [activeMoreInfoDownloadInfo, setActiveMoreInfoDownloadInfo] = useState({})
  const [runningDownloads, setRunningDownloads] = useState([])
  const [allDownloadsPaused, setAllDownloadsPaused] = useState(false)
  const [allDownloadsCompleted, setAllDownloadsCompleted] = useState(false)
  const [hasPausedDownload, setHasPausedDownload] = useState(false)
  const [totalDownloadFiles, setTotalDownloadFiles] = useState(0)
  const [totalCompletedFiles, setTotalCompletedFiles] = useState(0)
  const [downloadItems, setDownloadItems] = useState([])
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

  const onCloseChooseLocationDialog = () => {
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

  const onCancelDownloadItem = (downloadId) => {
    cancelDownloadItem({ downloadId })
    deleteAllToastsById(downloadId)
  }

  const onRestartDownload = (downloadId) => {
    restartDownload({ downloadId })
    deleteAllToastsById(downloadId)
  }

  const onResumeDownloadItem = (downloadId) => {
    resumeDownloadItem({ downloadId })
  }

  const onReportProgress = (event, info) => {
    const { progressReport } = info

    setRunningDownloads(progressReport)
  }

  const showMoreInfoDialog = (downloadId, numberErrors) => {
    setActiveMoreInfoDownloadInfo({ downloadId, numberErrors })
    setMoreErrorInfoIsOpen(true)
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
    setHasActiveDownload(!!(runningDownloads.length && runningDownloads.some(
      ({ state }) => state === downloadStates.active
    )))
    setHasPausedDownload(!!(runningDownloads.length && runningDownloads.some(
      ({ state }) => state === downloadStates.paused
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
  }, [runningDownloads])

  useEffect(() => {
    // Create the downloadItems array from the runningDownloads reported from the main process
    const items = runningDownloads.map((runningDownload) => {
      const {
        downloadId,
        // TODO stop using downloadName
        downloadName,
        errors,
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
      const shouldShowLogin = state === downloadStates.waitingForAuth
      const shouldShowEula = state === downloadStates.waitingForEula
      // const shouldShowError = state === downloadStates.error

      // Add errors
      if (state !== downloadStates.cancelled && errors) {
        const numberErrors = errors.length

        addToast({
          id: downloadId,
          title: 'An error occurred',
          message: `${numberErrors} ${pluralize('file', numberErrors)} failed to download in ${downloadId}`,
          numberErrors,
          variant: 'danger',
          actions: [
            {
              altText: 'Retry',
              buttonText: 'Retry',
              buttonProps: {
                Icon: FaRedo,
                onClick: () => {
                  retryErroredDownloadItem({ downloadId })
                  deleteAllToastsById(downloadId)
                }
              }
            },
            {
              altText: 'More Info',
              buttonText: 'More Info',
              buttonProps: {
                Icon: FaInfoCircle,
                hideLabel: true,
                onClick: () => showMoreInfoDialog(downloadId, numberErrors)
              }
            }
          ]
        })
      }

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
            label: 'View & Accept License Agreement',
            isActive: shouldShowEula,
            isPrimary: shouldShowEula,
            callback: () => sendToEula({
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
            callback: () => onRestartDownload(downloadId),
            icon: FaInfoCircle
          }
        ]
      ]

      return (
        <DownloadItem
          key={downloadId}
          downloadName={downloadName}
          hasErrors={errors && errors.length > 0}
          loadingMoreFiles={loadingMoreFiles}
          progress={progress}
          state={state}
          actionsList={actionsList}
        />
      )
    })

    setDownloadItems(items)
  }, [runningDownloads])

  const {
    downloadId: moreInfoDownloadId,
    numberErrors
  } = activeMoreInfoDownloadInfo

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
          onCloseChooseLocationDialog={onCloseChooseLocationDialog}
        />
      </Dialog>
      <Dialog
        open={moreErrorInfoIsOpen}
        setOpen={setMoreErrorInfoIsOpen}
        showTitle
        title="Errors occurred while downloading files"
        TitleIcon={FaExclamationCircle}
      >
        <MoreErrorInfo
          downloadId={moreInfoDownloadId}
          numberErrors={numberErrors}
          onCloseMoreErrorInfoDialog={setMoreErrorInfoIsOpen}
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
                          className={styles.headerButton}
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
                        className={styles.headerButton}
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
  hasActiveDownload: PropTypes.oneOfType([
    PropTypes.bool,
    PropTypes.number
  ]).isRequired,
  setHasActiveDownload: PropTypes.func.isRequired
}

export default Downloads
