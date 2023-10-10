import React, { useContext } from 'react'
import PropTypes from 'prop-types'
import {
  FaBan,
  FaClipboard,
  FaFolderOpen,
  FaUndo
} from 'react-icons/fa'

import downloadStates from '../../constants/downloadStates'
import { UNDO_TIMEOUT } from '../../constants/undoTimeout'

import useAppContext from '../../hooks/useAppContext'
import { ElectronApiContext } from '../../context/ElectronApiContext'

import DownloadItem from '../DownloadItem/DownloadItem'
import FileListItemPercent from './FileListItemPercent'
import FileListItemTimeRemaining from './FileListItemTimeRemaining'
import FileListItemSizeProgress from './FileListItemSizeProgress'

/**
 * @typedef {Object} FileListItemProps
 * @property {Object} file State of the file download.
 */

/**
 * Renders a `FileListItem` component
 * @param {FileListItemProps} props
 *
 * @example <caption>Renders a `FileListItem` component</caption>
 * return (
 *   <FileListItem
 *     file={file}
 *   />
 * )
 */
const FileListItem = ({
  file
}) => {
  const appContext = useAppContext()
  const {
    addToast,
    deleteAllToastsById
  } = appContext
  const {
    cancelDownloadItem,
    copyDownloadPath,
    openDownloadFolder,
    restartDownload,
    setCancellingDownload,
    setRestartingDownload,
    undoCancellingDownload,
    undoRestartingDownload
  } = useContext(ElectronApiContext)

  const {
    downloadId,
    filename,
    state,
    percent,
    receivedBytes,
    totalBytes,
    remainingTime
  } = file

  const shouldShowCancel = [
    downloadStates.pending,
    downloadStates.paused,
    downloadStates.active,
    downloadStates.error,
    downloadStates.interrupted
  ].includes(state)

  // Disable copy filepath if the download has not completed.
  const shouldDisableCopyFilePath = state !== downloadStates.completed

  // Disable open file if the download has not completed.
  const shouldDisableOpenFile = state !== downloadStates.completed

  const shouldDisableFileRestart = state === downloadStates.starting
    && state === downloadStates.pending

  const isComplete = state === downloadStates.completed

  // Show the time if the file is not pending or completed.
  const shouldShowTime = remainingTime > 0
    && state === downloadStates.active

  const shouldShowBytes = receivedBytes !== 0
    && state !== downloadStates.pending
    && state !== downloadStates.starting
    && state !== downloadStates.cancelled

  const onClickRestartFile = () => {
    const now = new Date().getTime()
    const restartId = `${filename}-${now}`

    // Set the download to be restarting by adding the restartId
    deleteAllToastsById(downloadId)
    setRestartingDownload({
      downloadId,
      filename,
      restartId
    })

    const toastId = `undo-restart-file-${filename}`

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
      message: 'File Restarted',
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
        filename,
        restartId
      })
    }, UNDO_TIMEOUT)
  }

  const onClickCancelFile = () => {
    const now = new Date().getTime()
    const cancelId = `${filename}-${now}`

    // Set the download to be restarting by adding the cancelId
    deleteAllToastsById(downloadId)
    setCancellingDownload({
      cancelId,
      downloadId,
      filename
    })

    const toastId = `undo-cancel-file-${filename}`

    let timeoutId

    // Setup an undo callback to provide to the toast that removes the cancelId
    const undoCallback = () => {
      // Undo was clicked, dismiss the setTimeout used to remove the undo toast
      clearTimeout(timeoutId)

      deleteAllToastsById(toastId)
      undoCancellingDownload({
        cancelId,
        downloadId,
        filename
      })
    }

    // Show an `undo` toast
    addToast({
      id: toastId,
      message: 'File Cancelled',
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
      cancelDownloadItem({
        downloadId,
        filename,
        cancelId
      })
    }, UNDO_TIMEOUT)
  }

  const actionsList = [
    [
      {
        label: 'Cancel File',
        isActive: shouldShowCancel,
        isPrimary: !isComplete,
        variant: 'danger',
        callback: onClickCancelFile,
        icon: FaBan
      }
    ],
    [
      {
        label: 'Open File',
        isActive: !shouldDisableOpenFile,
        isPrimary: isComplete,
        callback: () => openDownloadFolder({
          downloadId,
          filename
        }),
        icon: FaFolderOpen
      },
      {
        label: 'Copy File Path',
        isActive: !shouldDisableCopyFilePath,
        isPrimary: isComplete,
        callback: () => copyDownloadPath({
          downloadId,
          filename
        }),
        icon: FaClipboard
      },
      {
        label: 'Restart File',
        isActive: !shouldDisableFileRestart,
        isPrimary: false,
        callback: onClickRestartFile
      }
    ]
  ]

  return (
    <DownloadItem
      actionsList={actionsList}
      downloadId={downloadId}
      itemName={filename}
      percent={percent}
      state={state}
      primaryStatus={
        (
          state !== downloadStates.completed
          && percent > 0
          && (
            <FileListItemPercent
              percent={percent}
            />
          )
        )
      }
      secondaryStatus={
        (
          <FileListItemTimeRemaining
            percent={percent}
            remainingTime={remainingTime}
            shouldShowTime={shouldShowTime}
            state={state}
          />
        )
      }
      tertiaryStatus={
        (
          <FileListItemSizeProgress
            receivedBytes={receivedBytes}
            shouldShowBytes={shouldShowBytes}
            totalBytes={totalBytes}
          />
        )
      }
    />
  )
}

FileListItem.propTypes = {
  file: PropTypes.shape({
    downloadId: PropTypes.string,
    filename: PropTypes.string,
    state: PropTypes.string,
    percent: PropTypes.number,
    receivedBytes: PropTypes.number,
    totalBytes: PropTypes.number,
    remainingTime: PropTypes.number
  }).isRequired
}

export default FileListItem
