import React, { useContext } from 'react'
import PropTypes from 'prop-types'
import {
  FaBan,
  FaCheckCircle,
  FaChevronLeft,
  FaClipboard,
  FaExclamationCircle,
  FaFolder,
  FaFolderOpen,
  FaPause,
  FaPlay,
  FaSpinner,
  FaUndo
} from 'react-icons/fa'
import MiddleEllipsis from 'react-middle-ellipsis'
import * as VisuallyHidden from '@radix-ui/react-visually-hidden'
import classNames from 'classnames'

import useAppContext from '../../hooks/useAppContext'

import Button from '../Button/Button'
import Checkbox from '../Checkbox/Checkbox'
import Progress from '../Progress/Progress'
import Tooltip from '../Tooltip/Tooltip'

import { ElectronApiContext } from '../../context/ElectronApiContext'

import { PAGES } from '../../constants/pages'
import { UNDO_TIMEOUT } from '../../constants/undoTimeout'
import downloadStates from '../../constants/downloadStates'
import getHumanizedDownloadStates from '../../constants/humanizedDownloadStates'

import createVariantClassName from '../../utils/createVariantClassName'
import commafy from '../../utils/commafy'
import humanizeDuration from '../../utils/humanizeDuration'

import * as styles from './FileDownloadsHeader.module.scss'

/**
 * @typedef {Object} FileDownloadsHeaderProps
 * @property {Boolean} hideCompleted State of the hide completed checkbox.
 * @property {Function} setCheckboxState A function to update the state of the  `hide completed` checkbox.
 * @property {Function} setHideCompleted A function which sets the active page.
 * @property {Object} downloadsProgressReport An Object containing the progress of the download in view.

/**
 * Renders a `FileDownloadsHeader`
 * @param {FileDownloadsHeaderProps} props
 *
 * @example <caption>Renders an `FileDownloadsHeader` component.</caption>
 *
 * return (
 *   <FileDownloadsHeader
 *     hideCompleted={hideCompleted}
 *     setHideCompleted={setHideCompleted}
 *     setCurrentPage={setCurrentPage}
 *     downloadsProgressReport={downloadsProgressReport}
 *   />
 * )
 */
const FileDownloadsHeader = ({
  hideCompleted,
  headerReport,
  setHideCompleted,
  setCurrentPage
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
    pauseDownloadItem,
    resumeDownloadItem,
    setCancellingDownload,
    undoCancellingDownload
  } = useContext(ElectronApiContext)

  const {
    downloadLocation,
    elapsedTime,
    errors = {},
    estimatedTotalTimeRemaining,
    finishedFiles,
    id: downloadId,
    loadingMoreFiles,
    percent,
    state,
    totalFiles
  } = headerReport

  const onCancelDownloadItem = () => {
    const now = new Date().getTime()
    const cancelId = `cancel-downloads-${now}`

    // Set the download to be canceling by adding the cancelId
    deleteAllToastsById()
    setCancellingDownload({
      cancelId,
      downloadId
    })

    const toastId = 'undo-cancel-downloads'

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

  const onPauseDownloadItem = () => {
    pauseDownloadItem({ downloadId })
  }

  const onResumeDownloadItem = () => {
    resumeDownloadItem({ downloadId })
  }

  const hasErrors = errors[downloadId] && errors[downloadId].numberErrors > 0

  const shouldShowPause = [
    downloadStates.error,
    downloadStates.active
  ].includes(state)
  const shouldShowResume = [
    downloadStates.paused,
    downloadStates.error,
    downloadStates.interrupted
  ].includes(state)
  const shouldShowCancel = [
    downloadStates.paused,
    downloadStates.active,
    downloadStates.error,
    downloadStates.interrupted,
    downloadStates.waitingForAuth
  ].includes(state)

  const isComplete = state === downloadStates.completed

  let fileProgressMessage = commafy(finishedFiles)

  // Sqlite booleans are actually integers 1/0
  if (loadingMoreFiles === 0) {
    fileProgressMessage += ` of ${commafy(totalFiles)}`
  }

  fileProgressMessage += ` files downloaded in ${humanizeDuration(elapsedTime, {
    largest: 2,
    round: true
  })}`

  if (loadingMoreFiles === 1) {
    fileProgressMessage += ' (determining file count)'
  }

  const remainingTimeMessage = `${humanizeDuration(estimatedTotalTimeRemaining, {
    largest: 2,
    round: true
  })} remaining`

  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <Button
          className={styles.backLink}
          Icon={FaChevronLeft}
          size="lg"
          onClick={() => setCurrentPage(PAGES.downloads)}
        >
          Back to Downloads
        </Button>
      </div>

      <div className={styles.progress}>
        <div className={styles.statusDescription}>
          <div className={
            classNames([
              styles.statusDescriptionPrimary,
              styles[createVariantClassName(state)]
            ])
          }
          >
            {
              state === downloadStates.active && (
                <FaSpinner className={
                  classNames([
                    styles.statusDescriptionIcon,
                    styles.spinner
                  ])
                }
                />
              )
            }
            {
              state === downloadStates.paused && (
                <FaPause className={styles.statusDescriptionIcon} />
              )
            }
            {
              state === downloadStates.completed && (
                <FaCheckCircle className={styles.statusDescriptionIcon} />
              )
            }

            <span className={styles.status}>
              {getHumanizedDownloadStates(state, percent, hasErrors)}
            </span>

            {
              hasErrors && (
                <FaExclamationCircle
                  className={styles.hasErrorsIcon}
                />
              )
            }

          </div>
        </div>

        <div className={styles.progressMeta}>
          <div className={styles.progressFiles}>
            {fileProgressMessage}
          </div>

          <div className={styles.progressRemaining}>
            {!isComplete && remainingTimeMessage}
          </div>
        </div>

        <div className={styles.actions}>
          {
            shouldShowResume && (
              <Button
                className={styles.actionsButton}
                Icon={FaPlay}
                onClick={() => onResumeDownloadItem(downloadId)}
              >
                Resume
              </Button>
            )
          }
          {
            shouldShowPause && (
              <Button
                className={styles.actionsButton}
                Icon={FaPause}
                onClick={() => onPauseDownloadItem(downloadId)}
              >
                Pause
              </Button>
            )
          }
          {
            shouldShowCancel && (
              <Button
                className={styles.actionsButton}
                Icon={FaBan}
                variant="danger"
                onClick={() => onCancelDownloadItem(downloadId)}
              >
                Cancel
              </Button>
            )
          }

          {
            state === downloadStates.completed && (
              <>
                <Button
                  className={styles.actionsButton}
                  Icon={FaFolderOpen}
                  onClick={() => openDownloadFolder({ downloadId })}
                >
                  Open Folder
                </Button>
                <Button
                  className={styles.actionsButton}
                  Icon={FaClipboard}
                  onClick={() => copyDownloadPath({ downloadId })}
                >
                  Copy Path
                </Button>
              </>
            )
          }
        </div>
      </div>

      <div className={styles.progressBarWrapper}>
        <span className={styles.statusPercent}>
          {Math.round(percent)}
          %
        </span>
        <Progress
          className={styles.progressBar}
          progress={percent}
          state={state}
        />
      </div>

      <div className={styles.footer}>
        <Tooltip
          content={downloadLocation}
        >
          <div className={styles.downloadLocation}>
            <FaFolder className={styles.downloadLocationIcon} />
            {' '}
            <VisuallyHidden.Root>
              {downloadLocation}
            </VisuallyHidden.Root>
            <MiddleEllipsis key={downloadLocation}>
              <span
                className={styles.downloadLocationText}
                aria-hidden="true"
              >
                {downloadLocation}
              </span>
            </MiddleEllipsis>
          </div>
        </Tooltip>
        <div className={styles.footerSecondary}>
          <Checkbox
            id="hideCompleted"
            label="Hide Complete"
            onChange={
              () => {
                setHideCompleted(!hideCompleted)
              }
            }
            checked={hideCompleted}
          />
        </div>
      </div>
    </div>
  )
}

FileDownloadsHeader.propTypes = {
  hideCompleted: PropTypes.bool.isRequired,
  headerReport: PropTypes.shape({
    downloadLocation: PropTypes.string,
    elapsedTime: PropTypes.number,
    errors: PropTypes.shape({}),
    estimatedTotalTimeRemaining: PropTypes.number,
    finishedFiles: PropTypes.number,
    id: PropTypes.string,
    // Sqlite booleans are actually integers 1/0
    loadingMoreFiles: PropTypes.number,
    percent: PropTypes.number,
    percentSum: PropTypes.number,
    state: PropTypes.string,
    timeStart: PropTypes.number,
    totalFiles: PropTypes.number,
    totalTime: PropTypes.number,
    totalTimeRemaining: PropTypes.number
  }).isRequired,
  setCurrentPage: PropTypes.func.isRequired,
  setHideCompleted: PropTypes.func.isRequired
}

export default FileDownloadsHeader
