import React, { useContext } from 'react'
import PropTypes from 'prop-types'
import {
  FaBan,
  FaCheckCircle,
  FaChevronLeft,
  FaPause,
  FaPlay,
  FaSpinner
} from 'react-icons/fa'
import humanizeDuration from 'humanize-duration'
import MiddleEllipsis from 'react-middle-ellipsis'
import * as VisuallyHidden from '@radix-ui/react-visually-hidden'

import classNames from 'classnames'
import Button from '../Button/Button'
import Checkbox from '../Checkbox/Checkbox'
import Progress from '../Progress/Progress'

import { ElectronApiContext } from '../../context/ElectronApiContext'

import { PAGES } from '../../constants/pages'
import getHumanizedDownloadStates from '../../constants/humanizedDownloadStates'

import downloadStates from '../../constants/downloadStates'
import createVariantClassName from '../../utils/createVariantClassName'
import commafy from '../../utils/commafy'

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
  const {
    cancelDownloadItem,
    pauseDownloadItem,
    resumeDownloadItem
  } = useContext(ElectronApiContext)

  const {
    downloadLocation,
    elapsedTime,
    estimatedTotalTimeRemaining,
    finishedFiles,
    id: downloadId,
    loadingMoreFiles,
    percent,
    state,
    totalFiles
  } = headerReport

  const onCancelDownloadItem = () => {
    cancelDownloadItem({ downloadId })
  }

  const onPauseDownloadItem = () => {
    pauseDownloadItem({ downloadId })
  }

  const onResumeDownloadItem = () => {
    resumeDownloadItem({ downloadId })
  }

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

  fileProgressMessage += ` files completed in ${humanizeDuration(elapsedTime * 1000, {
    largest: 1,
    round: true
  })}`

  if (loadingMoreFiles === 1) {
    fileProgressMessage += ' (determining file count)'
  }

  const remainingTimeMessage = `${humanizeDuration(estimatedTotalTimeRemaining * 1000, {
    largest: 1,
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
              {getHumanizedDownloadStates(state)}
              {/* TODO EDD-27 'Downloading with errors'? */}
            </span>

            <span className={styles.statusPercent}>
              {percent}
              %
            </span>
          </div>
        </div>

        <div>
          <div className={styles.progressFiles}>
            {fileProgressMessage}
          </div>

          <div className={styles.progressRemaining}>
            {/* TODO this makes the progress bar jump up when the remaining time should not be displayed */}
            {!isComplete && remainingTimeMessage}
          </div>
        </div>

        <div className={styles.actions}>
          {
            // TODO when completed, file progress jumps to the right of the page because no buttons are visible
            shouldShowResume && (
              <Button
                className={styles.actionsButton}
                size="sm"
                Icon={FaPlay}
                onClick={() => onResumeDownloadItem(downloadId)}
              >
                Resume All
              </Button>
            )
          }
          {
            shouldShowPause && (
              <Button
                className={styles.actionsButton}
                size="sm"
                Icon={FaPause}
                onClick={() => onPauseDownloadItem(downloadId)}
              >
                Pause All
              </Button>
            )
          }
          {
            shouldShowCancel && (
              <Button
                className={styles.actionsButton}
                size="sm"
                Icon={FaBan}
                variant="danger"
                onClick={() => onCancelDownloadItem(downloadId)}
              >
                Cancel All
              </Button>
            )
          }
        </div>
      </div>

      <div className={styles.progressBarWrapper}>
        <Progress
          className={styles.progressBar}
          progress={percent}
          state={state}
        />
      </div>

      <div className={styles.footer}>
        <div className={styles.downloadLocation}>
          <VisuallyHidden.Root>
            <span>
              Downloading to
              {' '}
              {downloadLocation}
            </span>
          </VisuallyHidden.Root>

          <MiddleEllipsis key={downloadLocation}>
            <span
              className={styles.downloadLocationText}
              aria-hidden="true"
            >
              Downloading to
              {' '}
              {downloadLocation}
            </span>
          </MiddleEllipsis>
        </div>

        <Checkbox
          id="hideCompleted"
          label="Hide Completed"
          onChange={
            () => {
              setHideCompleted(!hideCompleted)
            }
          }
          checked={hideCompleted}
        />
      </div>
    </div>
  )
}

FileDownloadsHeader.propTypes = {
  hideCompleted: PropTypes.bool.isRequired,
  headerReport: PropTypes.shape({
    downloadLocation: PropTypes.string,
    estimatedTotalTimeRemaining: PropTypes.number,
    elapsedTime: PropTypes.number,
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
