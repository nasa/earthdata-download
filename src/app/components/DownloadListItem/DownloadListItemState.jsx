import React from 'react'
import PropTypes from 'prop-types'
import { FaCheckCircle, FaExclamationCircle } from 'react-icons/fa'
import pluralize from '../../utils/pluralize'

import getHumanizedDownloadStates from '../../constants/humanizedDownloadStates'
import downloadStates from '../../constants/downloadStates'
import useAccessibleEvent from '../../hooks/useAccessibleEvent'

import * as styles from './DownloadListItemState.module.scss'
import Tooltip from '../Tooltip/Tooltip'
import Button from '../Button/Button'

/**
 * @typedef {Object} DownloadListItemStateProps
 * @property {String} downloadId The id of the download.
 * @property {Number} numberErrors The number of errors.
 * @property {Number} percent The download percent of the DownloadItem.
 * @property {Boolean} showMoreInfoDialog A function to open the error modal.
 * @property {String} state The state of the download.
 */

/**
 * Renders a `DownloadListItemState` component
 * @param {DownloadListItemStateProps} props
 *
 * @example <caption>Renders a `DownloadListItemState` component</caption>
 * return (
 *   <DownloadListItemState
 *     state={state}
 *     percent={percent}
 *     hasErrors={hasErrors}
 *   />
 * )
 */
const DownloadListItemState = ({
  downloadId,
  numberErrors,
  percent,
  showMoreInfoDialog,
  state
}) => {
  const accessibleEventProps = useAccessibleEvent((event) => {
    event.stopPropagation()
    showMoreInfoDialog({
      downloadId,
      numberErrors,
      state
    })
  })

  return (
    <div
      className={styles.displayStatus}
    >
      {
        state === downloadStates.completed && (
          <FaCheckCircle className={styles.statusDescriptionIcon} />
        )
      }
      {getHumanizedDownloadStates(state, percent, numberErrors > 0)}
      {
        numberErrors > 0
        && (
          state !== downloadStates.waitingForAuth
          && state !== downloadStates.waitingForEula
        ) && (
          <Tooltip content="View more info">
            <Button
              className={styles.hasErrorsButton}
              align="baseline"
              size="sm"
              Icon={FaExclamationCircle}
              naked
              {...accessibleEventProps}
            >
              {`${numberErrors} ${pluralize('error', numberErrors)}`}
            </Button>
          </Tooltip>
        )
      }
    </div>
  )
}

DownloadListItemState.propTypes = {
  downloadId: PropTypes.string.isRequired,
  numberErrors: PropTypes.number.isRequired,
  percent: PropTypes.number.isRequired,
  showMoreInfoDialog: PropTypes.func.isRequired,
  state: PropTypes.string.isRequired
}

export default DownloadListItemState
