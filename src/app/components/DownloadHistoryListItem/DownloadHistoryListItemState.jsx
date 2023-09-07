import React from 'react'
import PropTypes from 'prop-types'
import { FaCheckCircle, FaExclamationCircle } from 'react-icons/fa'

import getHumanizedDownloadStates from '../../constants/humanizedDownloadStates'
import downloadStates from '../../constants/downloadStates'

import * as styles from './DownloadHistoryListItemState.module.scss'

/**
 * @typedef {Object} DownloadHistoryListItemStateProps
 * @property {String} state The state of the download.
 * @property {Number} percent The download percent of the DownloadItem.
 * @property {Boolean} hasErrors Does the download have any errors.
 */

/**
 * Renders a `DownloadHistoryListItemState` component
 * @param {DownloadHistoryListItemStateProps} props
 *
 * @example <caption>Renders a `DownloadHistoryListItemState` component</caption>
 * return (
 *   <DownloadHistoryListItemState
 *     state={state}
 *     percent={percent}
 *     hasErrors={hasErrors}
 *   />
 * )
 */
const DownloadHistoryListItemState = ({
  state,
  percent,
  hasErrors
}) => (
  <div
    className={styles.displayStatus}
  >
    {
      state === downloadStates.completed && (
        <FaCheckCircle className={styles.statusDescriptionIcon} />
      )
    }
    {
      hasErrors && (
        <FaExclamationCircle
          className={styles.hasErrorsIcon}
        />
      )
    }
    {getHumanizedDownloadStates(state, percent, hasErrors)}
  </div>
)

DownloadHistoryListItemState.defaultProps = {
  hasErrors: false
}

DownloadHistoryListItemState.propTypes = {
  hasErrors: PropTypes.bool,
  percent: PropTypes.number.isRequired,
  state: PropTypes.string.isRequired
}

export default DownloadHistoryListItemState
