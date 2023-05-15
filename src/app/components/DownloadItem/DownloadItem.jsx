import React from 'react'
import PropTypes from 'prop-types'

import Button from '../Button/Button'

// import downloadStates from '../../constants/downloadStates'

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

  // TODO I want to use the contants, but importing them from module.exports isn't working
  // const shouldShowPause = [
  //   downloadStates.active
  // ].includes(state)
  // const shouldShowResume = [
  //   downloadStates.paused,
  //   downloadStates.interrupted
  // ].includes(state)
  // const shouldShowCancel = [
  //   downloadStates.paused,
  //   downloadStates.active,
  //   downloadStates.error,
  //   downloadStates.interrupted
  // ].includes(state)
  const shouldShowPause = [
    'ACTIVE'
  ].includes(state)
  const shouldShowResume = [
    'PAUSED',
    'INTERRUPTED'
  ].includes(state)
  const shouldShowCancel = [
    'PAUSED',
    'ACTIVE',
    'ERROR',
    'INTERRUPTED'
  ].includes(state)

  return (
    <div>
      <div>
        {downloadName}
      </div>
      <div>
        {state}
      </div>
      <div>
        {percent}
        %
      </div>
      <div>
        {finishedFiles}
        {' '}
        of
        {' '}
        {totalFiles}
        {' '}
        in
        {' '}
        {totalTime}
        s
      </div>
      <div>
        {
          shouldShowPause && (
            <Button
              // className={styles.button}
              size="lg"
              // Icon={FaHistory}
              onClick={() => onPauseDownload(downloadId, downloadName)}
            >
              Pause
            </Button>
          )
        }
        {
          shouldShowResume && (
            <Button
              // className={styles.button}
              size="lg"
              // Icon={FaHistory}
              onClick={() => onResumeDownload(downloadId, downloadName)}
            >
              Resume
            </Button>
          )
        }
        {
          shouldShowCancel && (
            <Button
              // className={styles.button}
              size="lg"
              // Icon={FaHistory}
              onClick={() => onCancelDownload(downloadId, downloadName)}
            >
              Cancel
            </Button>
          )
        }
      </div>
    </div>
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
