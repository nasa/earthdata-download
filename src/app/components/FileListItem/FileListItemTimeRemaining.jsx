import React from 'react'
import PropTypes from 'prop-types'
import humanizeDuration from 'humanize-duration'

import downloadStates from '../../constants/downloadStates'

import * as styles from './FileListItemTimeRemaining.module.scss'
import getHumanizedDownloadStates from '../../constants/humanizedDownloadStates'

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
                  round: 1,
                  largest: 1
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
