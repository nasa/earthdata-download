import React from 'react'
import PropTypes from 'prop-types'
import { FaFileDownload } from 'react-icons/fa'

import downloadStates from '../../constants/downloadStates'
import commafy from '../../utils/commafy'
import humanizeDuration from '../../utils/humanizeDuration'

import * as styles from './DownloadHistoryListItemFileProgress.module.scss'

/**
 * @typedef {Object} DownloadHistoryListItemFileProgressProps
 * @property {Number} finishedFiles Total number of files in the download.
 * @property {String} state The state of the DownloadItem.
 * @property {Number} totalTime Total time the download has taken.
 */

/**
 * Renders a `DownloadHistoryListItemFileProgress` component
 * @param {DownloadHistoryListItemFileProgressProps} props
 *
 * @example <caption>Renders a `DownloadHistoryListItemFileProgress` component</caption>
 * return (
 *   <DownloadHistoryListItemFileProgress
 *     finishedFiles={finishedFiles}
 *     state={state}
 *     totalTime={totalTime}
 *   />
 * )
 */
const DownloadHistoryListItemFileProgress = ({
  finishedFiles,
  state,
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
        <FaFileDownload className={styles.statusInformationIcon} />
        {commafy(finishedFiles)}
        {' '}
        files in
        {' '}
        {humanizeDuration(totalTime)}
      </p>
    </div>
  )
}

DownloadHistoryListItemFileProgress.propTypes = {
  state: PropTypes.string.isRequired,
  finishedFiles: PropTypes.number.isRequired,
  totalTime: PropTypes.number.isRequired
}

export default DownloadHistoryListItemFileProgress
