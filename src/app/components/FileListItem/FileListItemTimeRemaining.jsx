import React from 'react'
import PropTypes from 'prop-types'
import humanizeDuration from 'humanize-duration'

import downloadStates from '../../constants/downloadStates'

import * as styles from './FileListItemTimeRemaining.module.scss'
import getHumanizedDownloadStates from '../../constants/humanizedDownloadStates'

/**
 * @typedef {Object} FileListItemTimeRemainingProps
 * @property {Number} percent The download percent of the DownloadItem.
 * @property {Number} remainingTime Remaining time in the download.
 * @property {Boolean} shouldShowTime Should the component show the time.
 * @property {String} state The state of the DownloadItem.
 */

/**
 * Renders a `FileListItemTimeRemaining` component
 * @param {FileListItemTimeRemainingProps} props
 *
 * @example <caption>Renders a `FileListItemTimeRemaining` component</caption>
 * return (
 *   <FileListItemTimeRemaining
 *     percent={percent}
 *     remainingTime={remainingTime}
 *     shouldShowTime={shouldShowTime}
 *     state={state}
 *   />
 * )
 */
const FileListItemTimeRemaining = ({
  percent,
  remainingTime,
  shouldShowTime,
  state
}) => {
  const shouldShowState = state !== downloadStates.completed
    && state !== downloadStates.active

  if (!shouldShowState && !shouldShowTime) return null

  return (
    <div
      className={styles.statusDescription}
    >
      <p
        className={styles.statusInformation}
        data-testid="file-downloads-list-time-remaining"
      >
        {shouldShowState && getHumanizedDownloadStates(state, percent)}
        {
          shouldShowTime && (
            <>
              {
                humanizeDuration(remainingTime * 1000, {
                  largest: 1,
                  round: 1
                })
              }
              {' '}
              remaining
            </>
          )
        }
      </p>
    </div>
  )
}

FileListItemTimeRemaining.defaultProps = {
  remainingTime: null
}

FileListItemTimeRemaining.propTypes = {
  percent: PropTypes.number.isRequired,
  remainingTime: PropTypes.number,
  shouldShowTime: PropTypes.bool.isRequired,
  state: PropTypes.string.isRequired
}

export default FileListItemTimeRemaining
