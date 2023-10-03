import React, { useContext } from 'react'
import PropTypes from 'prop-types'
import {
  FaBan,
  FaCheckCircle,
  FaPause,
  FaPlay,
  FaSpinner,
  FaUndo
} from 'react-icons/fa'
import classNames from 'classnames'

import downloadStates from '../../constants/downloadStates'
import createVariantClassName from '../../utils/createVariantClassName'
import getHumanizedDownloadStates from '../../constants/humanizedDownloadStates'
import useAppContext from '../../hooks/useAppContext'

import Button from '../Button/Button'

import { ElectronApiContext } from '../../context/ElectronApiContext'

import * as styles from './DownloadHeader.module.scss'
import { UNDO_TIMEOUT } from '../../constants/undoTimeout'

/**
 * @typedef {Object} DownloadHeaderProps
 * @property {Boolean} allDownloadsCompleted Are all downloads completed
 * @property {Boolean} allDownloadsPaused Are all downloads paused
 * @property {String} state State of the downloads
 * @property {Number} totalCompletedFiles Total number of completed files
 * @property {Number} totalFiles Total number of files
 */

/**
 * Renders a `DownloadHeader` component
 * @param {DownloadHeaderProps} props
 *
 * @example <caption>Renders a `DownloadHeader` component</caption>
 * return (
 *   <DownloadHeader
 *     allDownloadsCompleted={allDownloadsCompleted}
 *     allDownloadsPaused={allDownloadsPaused}
 *     state={derivedStateFromDownloads}
 *     totalCompletedFiles={totalCompletedFiles}
 *     totalFiles={totalFiles}
 *   />
 * )
 */
const DownloadHeader = ({
  state,
  totalCompletedFiles,
  totalFiles
}) => {
  const appContext = useAppContext()
  const {
    addToast,
    deleteAllToastsById
  } = appContext
  const {
    cancelDownloadItem,
    clearDownload,
    pauseDownloadItem,
    resumeDownloadItem,
    setCancellingDownload,
    undoCancellingDownload,
    undoClearDownload
  } = useContext(ElectronApiContext)

  const onCancelDownloadItem = () => {
    const now = new Date().getTime()
    const cancelId = `cancel-downloads-${now}`

    // Set the download to be canceling by adding the cancelId
    deleteAllToastsById()
    setCancellingDownload({
      cancelId
    })

    const toastId = 'undo-cancel-downloads'

    let timeoutId

    // Setup an undo callback to provide to the toast that removes the cancelId
    const undoCallback = () => {
      // Undo was clicked, dismiss the setTimeout used to remove the undo toast
      clearTimeout(timeoutId)

      deleteAllToastsById(toastId)
      undoCancellingDownload({ cancelId })
    }

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
        cancelId
      })
    }, UNDO_TIMEOUT)
  }

  const onClearDownloads = () => {
    const now = new Date().getTime()
    const clearId = `clear-downloads-${now}`

    // Set the download to be clearing by adding the clearId
    deleteAllToastsById()
    clearDownload({
      clearId
    })

    const toastId = 'undo-clear-downloads'

    let timeoutId

    // Setup an undo callback to provide to the toast that removes the clearId
    const undoCallback = () => {
      // Undo was clicked, dismiss the setTimeout used to remove the undo toast
      clearTimeout(timeoutId)

      deleteAllToastsById(toastId)
      undoClearDownload({
        clearId
      })
    }

    // Show an `undo` toast
    addToast({
      id: toastId,
      message: 'Downloads Cleared',
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

  const onPauseDownloadItem = () => {
    pauseDownloadItem({})
  }

  const onResumeDownloadItem = () => {
    resumeDownloadItem({})
  }

  return (
    <div
      className={
        classNames([
          styles.listHeader,
          styles[createVariantClassName(state)]
        ])
      }
    >
      <div className={styles.listHeaderPrimary}>
        {
          state === downloadStates.active && (
            <FaSpinner
              className={
                classNames([
                  styles.derivedStatusIcon,
                  styles.spinner
                ])
              }
            />
          )
        }
        {
          state === downloadStates.paused && (
            <FaPause className={styles.derivedStatusIcon} />
          )
        }
        {
          state === downloadStates.completed && (
            <FaCheckCircle className={styles.derivedStatusIcon} />
          )
        }
        <span className={styles.derivedStatus}>
          {
            state === downloadStates.active && (
              getHumanizedDownloadStates(downloadStates.active)
            )
          }
          {
            state === downloadStates.paused && (
              getHumanizedDownloadStates(downloadStates.paused)
            )
          }
          {
            state === downloadStates.completed && (
              getHumanizedDownloadStates(downloadStates.completed)
            )
          }
        </span>
        <span className={styles.humanizedStatus}>
          {totalCompletedFiles}
          {' '}
          of
          {' '}
          {totalFiles}
          {' '}
          files done
        </span>
      </div>
      <div className={styles.listHeaderSecondary}>
        {
          state !== downloadStates.completed
            ? (
              <>
                {
                  state !== downloadStates.paused
                    ? (
                      <Button
                        className={styles.headerButton}
                        size="sm"
                        Icon={FaPause}
                        onClick={onPauseDownloadItem}
                      >
                        Pause All
                      </Button>
                    )
                    : (
                      <Button
                        className={styles.headerButton}
                        size="sm"
                        Icon={FaPlay}
                        onClick={onResumeDownloadItem}
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
                  onClick={onCancelDownloadItem}
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
                onClick={onClearDownloads}
              >
                Clear Downloads
              </Button>
            )
        }
      </div>
    </div>
  )
}

DownloadHeader.defaultProps = {
  totalCompletedFiles: 0,
  totalFiles: 0
}

DownloadHeader.propTypes = {
  state: PropTypes.string.isRequired,
  totalCompletedFiles: PropTypes.number,
  totalFiles: PropTypes.number
}

export default DownloadHeader
