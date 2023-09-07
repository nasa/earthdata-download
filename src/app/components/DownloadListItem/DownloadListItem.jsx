import React, { useContext } from 'react'
import PropTypes from 'prop-types'
import {
  FaBan,
  FaClipboard,
  FaFolderOpen,
  FaInfoCircle,
  FaPause,
  FaPlay,
  FaSignInAlt
} from 'react-icons/fa'

import downloadStates from '../../constants/downloadStates'

import DownloadItem from '../DownloadItem/DownloadItem'

import DownloadListItemState from './DownloadListItemState'
import DownloadListItemPercent from './DownloadListItemPercent'
import DownloadListItemFileProgress from './DownloadListItemFileProgress'
import { ElectronApiContext } from '../../context/ElectronApiContext'
import useAppContext from '../../hooks/useAppContext'
import DownloadListItemMoreInfo from './DownloadListItemMoreInfo'

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
    sendToLogin
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
    downloadStates.cancelled
  ].includes(state)
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
        callback: () => {
          deleteAllToastsById(downloadId)
          cancelDownloadItem({ downloadId })
        },
        icon: FaBan
      }
    ],
    [
      {
        label: 'Open Folder',
        isActive: !shouldDisableOpenFolder,
        isPrimary: isComplete,
        callback: () => openDownloadFolder({ downloadId }),
        icon: FaFolderOpen,
        disabled: shouldDisableOpenFolder
      },
      {
        label: 'Copy Folder Path',
        isActive: true,
        isPrimary: isComplete,
        callback: () => copyDownloadPath({ downloadId }),
        icon: FaClipboard
      }
    ],
    [
      {
        label: 'Restart Download',
        isActive: true,
        isPrimary: false,
        callback: () => {
          deleteAllToastsById(downloadId)
          restartDownload({ downloadId })
        },
        icon: FaInfoCircle
      },
      {
        label: 'Clear Download',
        isActive: shouldShowClear,
        isPrimary: false,
        callback: () => {
          deleteAllToastsById(downloadId)
          clearDownload({ downloadId })
        },
        icon: FaInfoCircle
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
        (
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
            hasErrors={numberErrors > 0}
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
      moreInfo={
        (
          <DownloadListItemMoreInfo
            downloadId={downloadId}
            numberErrors={numberErrors}
            state={state}
            showMoreInfoDialog={showMoreInfoDialog}
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
