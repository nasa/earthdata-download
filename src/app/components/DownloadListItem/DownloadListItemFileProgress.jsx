import React from 'react'
import PropTypes from 'prop-types'
import { FaInfoCircle } from 'react-icons/fa'
import humanizeDuration from 'humanize-duration'

import downloadStates from '../../constants/downloadStates'
import commafy from '../../utils/commafy'

import Tooltip from '../Tooltip/Tooltip'

import * as styles from './DownloadListItemFileProgress.module.scss'

/**
 * @typedef {Object} DownloadListItemFileProgressProps
 * @property {Number} finishedFiles Number of finished files in the download.
 * @property {Boolean} loadingMoreFiles Is the download still loading more download links.
 * @property {Boolean} shouldShowProgress Should the component show the files progress.
 * @property {Boolean} shouldShowTime Should the component show the time.
 * @property {String} state The state of the DownloadItem.
 * @property {Number} totalFiles Total number of files in the download.
 * @property {Number} totalTime Total time the download has taken.
 */

/**
 * Renders a `DownloadListItemFileProgress` component
 * @param {DownloadListItemFileProgressProps} props
 *
 * @example <caption>Renders a `DownloadListItemFileProgress` component</caption>
 * return (
 *   <DownloadListItemFileProgress
 *     finishedFiles={finishedFiles}
 *     loadingMoreFiles={loadingMoreFiles}
 *     shouldShowProgress={shouldShowProgress}
 *     shouldShowTime={shouldShowTime}
 *     state={state}
 *     totalFiles={totalFiles}
 *     totalTime={totalTime}
 *   />
 * )
 */
const DownloadListItemFileProgress = ({
  finishedFiles,
  loadingMoreFiles,
  shouldShowProgress,
  shouldShowTime,
  state,
  totalFiles,
  totalTime
}) => {
  if (state === downloadStates.pending || state === downloadStates.error) return null

  return (
    <div className={styles.statusDescription}>
      <p className={styles.statusInformation}>
        {
          shouldShowProgress && (
            <>
              {commafy(finishedFiles)}
              {
                !loadingMoreFiles && (
                  <>
                    {' '}
                    of
                    {' '}
                    {commafy(totalFiles)}
                  </>
                )
              }
              {' '}
              files
            </>
          )
        }
        {
          (
            shouldShowTime && (
              <>
                {' '}
                done in
                {' '}
                {humanizeDuration(totalTime * 1000)}
              </>
            )
          )
        }
        {
          loadingMoreFiles && (
            <>
              {' '}
              (determining file count)
            </>
          )
        }
        {
          state === downloadStates.waitingForAuth && (
            <>
              {' '}
              Waiting for log in with Earthdata Login
              {' '}
              <Tooltip
                content="This download requires authentication with Earthdata Login. If your browser did not automatically open, click Log In."
              >
                <span className={styles.statusInformationTooltip}>
                  <FaInfoCircle className={styles.statusInformationIcon} />
                  <span>More Info</span>
                </span>
              </Tooltip>
            </>
          )
        }
        {
          state === downloadStates.waitingForEula && (
            <>
              {' '}
              Accept license agreement to continue
              {' '}
              <Tooltip
                content="Accept the license agreement to access the data you've requested. If your browser did not automatically open, click View & Accept License Agreement."
              >
                <span className={styles.statusInformationTooltip}>
                  <FaInfoCircle className={styles.statusInformationIcon} />
                  <span>More Info</span>
                </span>
              </Tooltip>
            </>
          )
        }
      </p>
    </div>
  )
}

DownloadListItemFileProgress.propTypes = {
  finishedFiles: PropTypes.number.isRequired,
  loadingMoreFiles: PropTypes.bool.isRequired,
  shouldShowProgress: PropTypes.bool.isRequired,
  shouldShowTime: PropTypes.bool.isRequired,
  state: PropTypes.string.isRequired,
  totalFiles: PropTypes.number.isRequired,
  totalTime: PropTypes.number.isRequired
}

export default DownloadListItemFileProgress
