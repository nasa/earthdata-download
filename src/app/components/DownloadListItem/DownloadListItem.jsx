import React, { useContext } from 'react'
import PropTypes from 'prop-types'
import {
  FaBan,
  FaClipboard,
  FaFolderOpen,
  FaPause,
  FaPlay,
  FaSignInAlt,
  FaUndo
} from 'react-icons/fa'

import metricsLogger from '../../logging/metricsLogger.ts'
import downloadStates from '../../constants/downloadStates'
import { UNDO_TIMEOUT } from '../../constants/undoTimeout'

import DownloadItem from '../DownloadItem/DownloadItem'

import DownloadListItemState from './DownloadListItemState'
import DownloadListItemPercent from './DownloadListItemPercent'
import DownloadListItemFileProgress from './DownloadListItemFileProgress'
import { ElectronApiContext } from '../../context/ElectronApiContext'
import useAppContext from '../../hooks/useAppContext'

/**
 * @typedef {Object} DownloadListItemProps
 * @property {Object} download State of the download item.
 * @property {Function} setCurrentPage A function which sets the active page.
 * @property {Function} setSelectedDownloadId A function which sets the setSelectedDownloadId.
 */

/**
 * Renders a `DownloadListItem` component
 * @param {DownloadListItemProps} props
 *
 * @example <caption>Renders a `DownloadListItem` component</caption>
 * return (
 *   <DownloadListItem
 *     download={download}
 *     setCurrentPage={setCurrentPage}
 *     setSelectedDownloadId={setSelectedDownloadId}
 *   />
 * )
 */
const DownloadListItem = ({
  download,
  setCurrentPage,
  setSelectedDownloadId,
  showMoreInfoDialog
}) => {
  const appContext = useAppContext()
  const {
    addToast,
    deleteAllToastsById
  } = appContext
  const {
    cancelDownloadItem,
    clearDownload,
    copyDownloadPath,
    openDownloadFolder,
    pauseDownloadItem,
    restartDownload,
    resumeDownloadItem,
    sendToEula,
    sendToLogin,
    setCancellingDownload,
    setRestartingDownload,
    undoCancellingDownload,
    undoClearDownload,
    undoRestartingDownload
  } = useContext(ElectronApiContext)

  const {
    downloadId,
    numberErrors = 0,
    loadingMoreFiles,
    progress,
    state
  } = download

  const {
    percent = 0,
    finishedFiles,
    totalFiles,
    totalTime
  } = progress

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
  const shouldShowClear = [
    downloadStates.completed,
    downloadStates.cancelled,
    downloadStates.error,
    downloadStates.errorFetchingLinks
  ].includes(state)
  const shouldShowActions = state !== downloadStates.errorFetchingLinks
  const shouldDisableOpenFolder = finishedFiles === 0
  const isComplete = state === downloadStates.completed
  const shouldShowLogin = state === downloadStates.waitingForAuth
  const shouldShowEula = state === downloadStates.waitingForEula
  const shouldShowProgress = (state !== downloadStates.pending)
    && (
      percent > 0
      || (
        state !== downloadStates.waitingForEula
        && state !== downloadStates.waitingForAuth
      )
    )
  const shouldShowTime = state !== downloadStates.pending
    && state !== downloadStates.waitingForEula
    && state !== downloadStates.waitingForAuth
    && totalFiles > 0
  const shouldBeClickable = state !== downloadStates.starting
    && state !== downloadStates.pending
    && totalFiles > 0

  const onClickClearDownload = () => {
    const now = new Date().getTime()
    const clearId = `${downloadId}-${now}`

    // Clear the download
    deleteAllToastsById(downloadId)
    clearDownload({
      clearId,
      downloadId
    })

    const toastId = `undo-clear-${downloadId}`

    let timeoutId

    // Setup an undo callback to provide to the toast that flips the active flag back to true
    const undoCallback = () => {
      // Undo was clicked, dismiss the setTimeout used to remove the undo toast
      clearTimeout(timeoutId)

      undoClearDownload({ clearId })
      deleteAllToastsById(toastId)
    }

    // Show an `undo` toast
    addToast({
      id: toastId,
      message: 'Download Cleared',
      variant: 'none',
      actions: [
        {
          altText: 'Undo',
          buttonText: 'Undo',
          buttonProps: {
            Icon: FaUndo,
            onClick: undoCallback
          }
        }
      ]
    })

    // After the UNDO_TIMEOUT time has passed, remove the undo toast
    timeoutId = setTimeout(() => {
      deleteAllToastsById(toastId)
    }, UNDO_TIMEOUT)
  }

  const onClickRestartDownload = () => {
    const now = new Date().getTime()
    const restartId = `${downloadId}-${now}`

    // Set the download to be restarting by adding the restartId
    deleteAllToastsById(downloadId)
    setRestartingDownload({
      downloadId,
      restartId
    })

    const toastId = `undo-restart-download-${downloadId}`

    let timeoutId

    // Setup an undo callback to provide to the toast that removes the restartId
    const undoCallback = () => {
      // Undo was clicked, dismiss the setTimeout used to remove the undo toast
      clearTimeout(timeoutId)

      deleteAllToastsById(toastId)
      undoRestartingDownload({ restartId })
    }

    metricsLogger({
      eventType: 'DownloadRestart',
      data: {
        downloadId: download.downloadId,
        percent: download.progress.percent,
        finishedFiles: download.progress.finishedFiles,
        totalFiles: download.progress.totalFiles
      }
    })

    // Show an `undo` toast
    addToast({
      id: toastId,
      message: 'Download Restarted',
      variant: 'none',
      actions: [
        {
          altText: 'Undo',
          buttonText: 'Undo',
          buttonProps: {
            Icon: FaUndo,
            onClick: undoCallback
          }
        }
      ]
    })

    // After the UNDO_TIMEOUT time has passed, remove the undo toast
    timeoutId = setTimeout(() => {
      deleteAllToastsById(toastId)

      // Actually restart the download
      restartDownload({
        downloadId,
        restartId
      })
    }, UNDO_TIMEOUT)
  }

  const onClickCancelDownload = () => {
    const now = new Date().getTime()
    const cancelId = `${downloadId}-${now}`

    // Set the download to be canceling by adding the cancelId
    deleteAllToastsById(downloadId)
    setCancellingDownload({
      cancelId,
      downloadId
    })

    const toastId = `undo-cancel-download-${downloadId}`

    let timeoutId

    // Setup an undo callback to provide to the toast that removes the cancelId
    const undoCallback = () => {
      // Undo was clicked, dismiss the setTimeout used to remove the undo toast
      clearTimeout(timeoutId)

      deleteAllToastsById(toastId)
      undoCancellingDownload({
        cancelId,
        downloadId
      })
    }

    metricsLogger({
      eventType: 'DownloadCancel',
      data: {
        downloadId: download.downloadId,
        percent: download.progress.percent,
        finishedFiles: download.progress.finishedFiles,
        totalFiles: download.progress.totalFiles
      }
    })

    // Show an `undo` toast
    addToast({
      id: toastId,
      message: 'Download Cancelled',
      variant: 'none',
      actions: [
        {
          altText: 'Undo',
          buttonText: 'Undo',
          buttonProps: {
            Icon: FaUndo,
            onClick: undoCallback
          }
        }
      ]
    })

    // After the UNDO_TIMEOUT time has passed, remove the undo toast
    timeoutId = setTimeout(() => {
      deleteAllToastsById(toastId)

      // Actually cancel the download
      cancelDownloadItem({
        downloadId,
        cancelId
      })
    }, UNDO_TIMEOUT)
  }

  const actionsList = [
    [
      {
        label: 'Log In with Earthdata Login',
        isActive: shouldShowLogin,
        isPrimary: shouldShowLogin,
        callback: () => sendToLogin({
          downloadId,
          forceLogin: true
        }),
        icon: FaSignInAlt
      },
      {
        label: 'View & Accept License Agreement',
        isActive: shouldShowEula,
        isPrimary: shouldShowEula,
        callback: () => sendToEula({
          downloadId,
          forceLogin: true
        }),
        icon: FaSignInAlt
      },
      {
        label: 'Pause Download',
        isActive: shouldShowPause,
        isPrimary: !isComplete,
        callback: () => pauseDownloadItem({ downloadId }),
        icon: FaPause
      },
      {
        label: 'Resume Download',
        isActive: shouldShowResume && !shouldShowPause,
        isPrimary: !isComplete,
        callback: () => resumeDownloadItem({ downloadId }),
        icon: FaPlay
      },
      {
        label: 'Cancel Download',
        isActive: shouldShowCancel,
        isPrimary: !isComplete,
        variant: 'danger',
        callback: onClickCancelDownload,
        icon: FaBan
      }
    ],
    [
      {
        label: 'Open Folder',
        isActive: shouldShowActions && !shouldDisableOpenFolder,
        isPrimary: isComplete,
        callback: () => openDownloadFolder({ downloadId }),
        icon: FaFolderOpen,
        disabled: shouldDisableOpenFolder
      },
      {
        label: 'Copy Folder Path',
        isActive: shouldShowActions,
        isPrimary: isComplete,
        callback: () => copyDownloadPath({ downloadId }),
        icon: FaClipboard
      }
    ],
    [
      {
        label: 'Restart Download',
        isActive: shouldShowActions,
        isPrimary: false,
        callback: onClickRestartDownload
      },
      {
        label: 'Clear Download',
        isActive: shouldShowClear,
        isPrimary: false,
        callback: onClickClearDownload
      }
    ]
  ]

  return (
    <DownloadItem
      actionsList={actionsList}
      downloadId={downloadId}
      setCurrentPage={setCurrentPage}
      setSelectedDownloadId={setSelectedDownloadId}
      showMoreInfoDialog={showMoreInfoDialog}
      shouldBeClickable={shouldBeClickable}
      state={state}
      itemName={downloadId}
      percent={percent}
      primaryStatus={
        state !== downloadStates.completed && percent > 0 && (
          <DownloadListItemPercent
            percent={percent}
          />
        )
      }
      secondaryStatus={
        (
          <DownloadListItemState
            state={state}
            percent={percent}
            downloadId={downloadId}
            numberErrors={numberErrors}
            showMoreInfoDialog={showMoreInfoDialog}
          />
        )
      }
      tertiaryStatus={
        (
          <DownloadListItemFileProgress
            finishedFiles={finishedFiles}
            loadingMoreFiles={loadingMoreFiles}
            shouldShowProgress={shouldShowProgress}
            shouldShowTime={shouldShowTime}
            state={state}
            totalFiles={totalFiles}
            totalTime={totalTime}
          />
        )
      }
    />
  )
}

DownloadListItem.defaultProps = {
  setCurrentPage: null,
  setSelectedDownloadId: null
}

DownloadListItem.propTypes = {
  download: PropTypes.shape({
    downloadId: PropTypes.string,
    numberErrors: PropTypes.number,
    loadingMoreFiles: PropTypes.bool,
    progress: PropTypes.shape({
      percent: PropTypes.number,
      finishedFiles: PropTypes.number,
      totalFiles: PropTypes.number,
      totalTime: PropTypes.number
    }),
    state: PropTypes.string
  }).isRequired,
  setCurrentPage: PropTypes.func,
  setSelectedDownloadId: PropTypes.func,
  showMoreInfoDialog: PropTypes.func.isRequired
}

export default DownloadListItem
