import React from 'react'
import PropTypes from 'prop-types'
import {
  FaCheckCircle,
  FaExclamationCircle,
  FaSpinner
} from 'react-icons/fa'
import classNames from 'classnames'

import getHumanizedDownloadStates from '../../constants/humanizedDownloadStates'
import downloadStates from '../../constants/downloadStates'

import * as styles from './DownloadListItemState.module.scss'

const DownloadListItemState = ({
  state,
  percent,
  hasErrors
}) => (
  <div
    className={styles.displayStatus}
  >
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

DownloadListItemState.defaultProps = {
  hasErrors: false
}

DownloadListItemState.propTypes = {
  hasErrors: PropTypes.bool,
  percent: PropTypes.number.isRequired,
  state: PropTypes.string.isRequired
}

export default DownloadListItemState
