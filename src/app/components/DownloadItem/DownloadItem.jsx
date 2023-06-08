import React from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import {
  FaCheckCircle,
  FaSpinner
} from 'react-icons/fa'
import humanizeDuration from 'humanize-duration'
import Button from '../Button/Button'
import Dropdown from '../Dropdown/Dropdown'
import Progress from '../Progress/Progress'

import * as styles from './DownloadItem.module.scss'
import createVariantClassName from '../../utils/createVariantName'
import Tooltip from '../Tooltip/Tooltip'

import downloadStates from '../../constants/downloadStates'
import humanizedDownloadStates from '../../constants/humanizedDownloadStates'

/**
 * @typedef {Object} DownloadItemProps
 * @property {String} downloadName The name of the DownloadItem.
 * @property {Object} progress The progress of the DownloadItem.
 * @property {String} state The state of the DownloadItem.
 * @property {Array} actionsList A 2-D array of objects detailing action attributes.
/**
 * Renders a DownloadItem
 * @param {DownloadItemProps} props
 *
 * @example <caption>Render a DownloadItem.</caption>
 *
 * return (
 *   <DownloadItem
 *     key={downloadId}
 *     downloadName={downloadName}
 *     progress={progress}
 *     state={state}
 *     actionsList={actionsList},
 *   />
 * )
 */
const DownloadItem = ({
  downloadName,
  progress,
  state,
  actionsList,
}) => {
  const {
    percent,
    finishedFiles,
    totalFiles,
    totalTime
  } = progress

  const primaryActions = []
  if (actionsList) {
    actionsList.forEach((actionGroup) => {
      actionGroup.forEach((action) => {
        primaryActions.push(
          (action.isActive && action.isPrimary) && (
            <Tooltip content={action.label} key={action.label}>
              <Button
                className={styles.action}
                size="sm"
                Icon={action.icon}
                hideLabel
                onClick={action.callback}
                variant={action.variant}
              >
                {
                  action.label
                }
              </Button>
            </Tooltip>
          )
        )
      })
    })
  }

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
              primaryActions
            }
            <Dropdown actionsList={actionsList} />
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

DownloadItem.defaultProps = {
  actionsList: null
}

DownloadItem.propTypes = {
  downloadName: PropTypes.string.isRequired,
  progress: PropTypes.shape({
    percent: PropTypes.number,
    finishedFiles: PropTypes.number,
    totalFiles: PropTypes.number,
    totalTime: PropTypes.number
  }).isRequired,
  state: PropTypes.string.isRequired,
  actionsList: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.shape({
    label: PropTypes.string.isRequired,
    isActive: PropTypes.bool.isRequired,
    isPrimary: PropTypes.bool.isRequired,
    variant: PropTypes.string,
    callback: PropTypes.func.isRequired,
    icon: PropTypes.func.isRequired,
    disabled: PropTypes.bool
  })))
}

export default DownloadItem
