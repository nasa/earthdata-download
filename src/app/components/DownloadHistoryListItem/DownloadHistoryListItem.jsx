import React, { useContext } from 'react'
import PropTypes from 'prop-types'
import {
  FaBan,
  FaClipboard,
  FaFolderOpen,
  FaInfoCircle,
  FaUndo
} from 'react-icons/fa'

import DownloadItem from '../DownloadItem/DownloadItem'

import DownloadHistoryListItemFileProgress from './DownloadHistoryListItemFileProgress'
import { ElectronApiContext } from '../../context/ElectronApiContext'
import useAppContext from '../../hooks/useAppContext'
import DownloadHistoryListItemState from './DownloadHistoryListItemState'
import DownloadHistoryListItemTimestamp from './DownloadHistoryListItemTimestamp'

import downloadStates from '../../constants/downloadStates'
import { UNDO_TIMEOUT } from '../../constants/undoTimeout'

/**
 * @typedef {Object} DownloadHistoryListItemProps
 * @property {Object} download State of the download item.
 * @property {Function} showMoreInfoDialog A function to set the `showMoreInfoDialog` in the layout.
 */

/**
 * Renders a `DownloadHistoryListItem` component
 * @param {DownloadHistoryListItemProps} props
 *
 * @example <caption>Renders a `DownloadHistoryListItem` component</caption>
 * return (
 *   <DownloadHistoryListItem
 *     download={download}
 *     showMoreInfoDialog={showMoreInfoDialog}
 *   />
 * )
 */
const DownloadHistoryListItem = ({
  download,
  showMoreInfoDialog
}) => {
  const appContext = useAppContext()
  const {
    addToast,
    deleteAllToastsById
  } = appContext
  const {
    copyDownloadPath,
    deleteDownloadHistory,
    openDownloadFolder,
    restartDownload,
    setPendingDeleteDownloadHistory,
    setRestartingDownload,
    undoDeleteDownloadHistory,
    undoRestartingDownload
  } = useContext(ElectronApiContext)

  const {
    downloadId,
    numberErrors = 0,
    progress,
    state,
    timeStart
  } = download

  const {
    percent = 0,
    finishedFiles,
    totalTime
  } = progress

  const shouldShowActions = state !== downloadStates.errorFetchingLinks

  const onClickDeleteDownload = () => {
    const now = new Date().getTime()
    const deleteId = `${downloadId}-${now}`

    // Clear the download
    deleteAllToastsById(downloadId)
    setPendingDeleteDownloadHistory({
      downloadId,
      deleteId
    })

    const toastId = `undo-clear-history-${downloadId}`

    let timeoutId

    // Setup an undo callback to provide to the toast that flips the active flag back to true
    const undoCallback = () => {
      // Undo was clicked, dismiss the setTimeout used to remove the undo toast
      clearTimeout(timeoutId)

      deleteAllToastsById(toastId)
      undoDeleteDownloadHistory({
        deleteId
      })
    }

    // Show an `undo` toast
    addToast({
      id: toastId,
      message: 'Download Deleted',
      variant: 'spinner',
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

      // Actually clear the history
      deleteDownloadHistory({
        deleteId
      })
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

    // Show an `undo` toast
    addToast({
      id: toastId,
      message: 'Download Restarted',
      variant: 'spinner',
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

  const actionsList = [
    [
      {
        label: 'Open Folder',
        isActive: shouldShowActions,
        isPrimary: true,
        callback: () => openDownloadFolder({ downloadId }),
        icon: FaFolderOpen
      },
      {
        label: 'Copy Folder Path',
        isActive: shouldShowActions,
        isPrimary: true,
        callback: () => copyDownloadPath({ downloadId }),
        icon: FaClipboard
      }
    ],
    [
      {
        label: 'Restart Download',
        isActive: shouldShowActions,
        isPrimary: false,
        callback: onClickRestartDownload,
        icon: FaInfoCircle
      },
      {
        label: 'Delete Download',
        isActive: true,
        isPrimary: false,
        callback: onClickDeleteDownload,
        icon: FaBan
      }
    ]
  ]

  return (
    <DownloadItem
      actionsList={actionsList}
      downloadId={downloadId}
      showMoreInfoDialog={showMoreInfoDialog}
      shouldBeClickable={false}
      state={state}
      itemName={downloadId}
      percent={percent}
      primaryStatus={
        (
          <DownloadHistoryListItemState
            state={state}
            percent={percent}
            hasErrors={numberErrors > 0}
          />
        )
      }
      secondaryStatus={
        (
          <DownloadHistoryListItemFileProgress
            finishedFiles={finishedFiles}
            state={state}
            totalTime={totalTime}
          />
        )
      }
      subStatus={
        (
          <DownloadHistoryListItemTimestamp
            time={timeStart}
          />
        )
      }
    />
  )
}

DownloadHistoryListItem.propTypes = {
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
    state: PropTypes.string,
    timeStart: PropTypes.number
  }).isRequired,
  showMoreInfoDialog: PropTypes.func.isRequired
}

export default DownloadHistoryListItem
