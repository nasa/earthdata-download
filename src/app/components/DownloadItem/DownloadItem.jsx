import React from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import {
  FaBan,
  FaCheckCircle,
  FaClipboard,
  FaEllipsisV,
  FaFolderOpen,
  FaPause,
  FaPlay,
  FaSpinner
} from 'react-icons/fa'
import humanizeDuration from 'humanize-duration'

import Button from '../Button/Button'
import Progress from '../Progress/Progress'

import * as styles from './DownloadItem.module.scss'
import createVariantClassName from '../../utils/createVariantName'
import Tooltip from '../Tooltip/Tooltip'

import downloadStates from '../../constants/downloadStates'
import humanizedDownloadStates from '../../constants/humanizedDownloadStates'

/**
 * @typedef {Object} DownloadItemProps
 * @property {String} downloadId The downloadId the DownloadId belongs to.
 * @property {String} downloadName The name of the DownloadItem.
 * @property {Object} progress The progress of the DownloadItem.
 * @property {String} state The state of the DownloadItem.
 * @property {Function} onCancelDownload A function which cancels a DownloadItem.
 * @property {Function} onPauseDownload A function which pauses a DownloadItem.
 * @property {Function} onResumeDownload A function which resumes a DownloadItem.

/**
 * Renders a DownloadItem
 * @param {DownloadItemProps} props
 *
 * @example <caption>Render a DownloadItem.</caption>
 *
 * return (
 *   <DownloadItem
 *     key={downloadId}
 *     downloadId={downloadId}
 *     downloadName={downloadName}
 *     progress={progress}
 *     state={state}
 *     onPauseDownload={onPauseDownloadItem}
 *     onResumeDownload={onResumeDownloadItem}
 *     onCancelDownload={onCancelDownloadItem}
 *   />
 * )
 */
const DownloadItem = ({
  downloadId,
  downloadName,
  progress,
  state,
  onCancelDownload,
  onPauseDownload,
  onResumeDownload
}) => {
  const {
    percent,
    finishedFiles,
    totalFiles,
    totalTime
  } = progress

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
  const shouldShowOpenFolder = [
    downloadStates.completed
  ].includes(state)
  const shouldShowCopyPath = [
    downloadStates.completed
  ].includes(state)

  return (
    <li
      className={
        classNames([
          styles.wrapper,
          styles[createVariantClassName(state)]
        ])
      }
      data-testid="download-item"
    >
      <div
        className={styles.innerWrapper}
        onClick={() => {}}
        onKeyDown={() => {}}
        role="button"
        tabIndex="0"
      >
        <h3 className={styles.name}>
          {downloadName}
        </h3>
        <div className={styles.meta}>
          <div className={styles.metaPrimary}>
            <div className={styles.percentComplete}>
              {percent}
              %
            </div>
            {humanizedDownloadStates[state] && (
            <div className={styles.displayStatus}>
              {
                state === downloadStates.active && (
                  <FaSpinner
                    className={
                      classNames([
                        styles.statusDescriptionIcon,
                        styles.spinner
                      ])
                    }
                  />
                )
              }
              {
                state === downloadStates.completed && (
                  <FaCheckCircle className={styles.statusDescriptionIcon} />
                )
              }
              {humanizedDownloadStates[state]}
            </div>
            )}
            <div className={styles.statusDescription}>
              {finishedFiles}
              {' '}
              of
              {' '}
              {totalFiles}
              {' '}
              files done in
              {' '}
              {humanizeDuration(totalTime * 1000)}
            </div>
          </div>
          <div className={styles.metaSecondary}>
            {
              shouldShowPause && (
                <Tooltip content="Pause Download">
                  <Button
                    className={styles.action}
                    size="sm"
                    Icon={FaPause}
                    hideLabel
                    onClick={() => onPauseDownload(downloadId, downloadName)}
                  >
                    Pause Download
                  </Button>
                </Tooltip>
              )
            }
            {
              shouldShowResume && (
                <Tooltip content="Resume Download">
                  <Button
                    className={styles.action}
                    size="sm"
                    Icon={FaPlay}
                    hideLabel
                    onClick={() => onResumeDownload(downloadId, downloadName)}
                  >
                    Resume Download
                  </Button>
                </Tooltip>
              )
            }
            {
              shouldShowCancel && (
                <Tooltip content="Cancel Download">
                  <Button
                    className={styles.action}
                    size="sm"
                    Icon={FaBan}
                    hideLabel
                    onClick={() => onCancelDownload(downloadId, downloadName)}
                    variant="danger"
                  >
                    Cancel Download
                  </Button>
                </Tooltip>
              )
            }
            {
              shouldShowOpenFolder && (
                <Tooltip content="Open Folder">
                  <Button
                    className={styles.action}
                    size="sm"
                    Icon={FaFolderOpen}
                    hideLabel
                    onClick={() => {}}
                    tabIndex="0"
                  >
                    Open Folder
                  </Button>
                </Tooltip>
              )
            }
            {
              shouldShowCopyPath && (
                <Tooltip content="Copy Folder Path">
                  <Button
                    className={styles.action}
                    size="sm"
                    Icon={FaClipboard}
                    hideLabel
                    onClick={() => {}}
                    tabIndex="0"
                  >
                    Copy Folder Path
                  </Button>
                </Tooltip>
              )
            }
            <Tooltip content="More Actions">
              <Button
                className={styles.action}
                size="sm"
                Icon={FaEllipsisV}
                hideLabel
                onClick={() => {}}
              >
                More Actions
              </Button>
            </Tooltip>
          </div>
        </div>
        <div>
          <Progress
            className={styles.progress}
            progress={percent}
            state={state}
          />
        </div>
        <div style={{ width: `${percent}%` }} className={styles.progressBackground} />
      </div>
    </li>
  )
}

DownloadItem.propTypes = {
  downloadId: PropTypes.string.isRequired,
  downloadName: PropTypes.string.isRequired,
  progress: PropTypes.shape({
    percent: PropTypes.number,
    finishedFiles: PropTypes.number,
    totalFiles: PropTypes.number,
    totalTime: PropTypes.number
  }).isRequired,
  state: PropTypes.string.isRequired,
  onCancelDownload: PropTypes.func.isRequired,
  onPauseDownload: PropTypes.func.isRequired,
  onResumeDownload: PropTypes.func.isRequired
}

export default DownloadItem
