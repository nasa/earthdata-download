import React from 'react'
import PropTypes from 'prop-types'
import humanizeDuration from 'humanize-duration'

import downloadStates from '../../constants/downloadStates'
import commafy from '../../utils/commafy'

import * as styles from './DownloadHistoryListItemFileProgress.module.scss'

/**
 * @typedef {Object} DownloadHistoryListItemFileProgressProps
 * @property {String} state The state of the DownloadItem.
 * @property {Number} totalFiles Total number of files in the download.
 * @property {Number} totalTime Total time the download has taken.
 */

/**
 * Renders a `DownloadHistoryListItemFileProgress` component
 * @param {DownloadHistoryListItemFileProgressProps} props
 *
 * @example <caption>Renders a `DownloadHistoryListItemFileProgress` component</caption>
 * return (
 *   <DownloadHistoryListItemFileProgress
 *     state={state}
 *     totalFiles={totalFiles}
 *     totalTime={totalTime}
 *   />
 * )
 */
const DownloadHistoryListItemFileProgress = ({
  state,
  totalFiles,
  totalTime
}) => {
  if (
    state === downloadStates.cancelled
    || state === downloadStates.error
    || state === downloadStates.errorFetchingLinks
  ) return null

  return (
    <div className={styles.statusDescription}>
      <p className={styles.statusInformation}>
        {commafy(totalFiles)}
        {' '}
        files in
        {' '}
        {
          humanizeDuration(totalTime, {
            largest: 2,
            round: 1
          })
        }
      </p>
    </div>
  )
}

DownloadHistoryListItemFileProgress.propTypes = {
  state: PropTypes.string.isRequired,
  totalFiles: PropTypes.number.isRequired,
  totalTime: PropTypes.number.isRequired
}

export default DownloadHistoryListItemFileProgress
