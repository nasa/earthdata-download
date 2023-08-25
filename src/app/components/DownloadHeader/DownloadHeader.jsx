import React, { useContext } from 'react'
import PropTypes from 'prop-types'
import {
  FaBan,
  FaCheckCircle,
  FaPause,
  FaPlay,
  FaSpinner
} from 'react-icons/fa'
import classNames from 'classnames'

import downloadStates from '../../constants/downloadStates'
import createVariantClassName from '../../utils/createVariantClassName'
import getHumanizedDownloadStates from '../../constants/humanizedDownloadStates'
import useAppContext from '../../hooks/useAppContext'

import Button from '../Button/Button'

import { ElectronApiContext } from '../../context/ElectronApiContext'

import * as styles from './DownloadHeader.module.scss'

/**
 * @typedef {Object} DownloadHeaderProps
 * @property {Boolean} allDownloadsCompleted Are all downloads completed
 * @property {Boolean} allDownloadsPaused Are all downloads paused
 * @property {String} state State of the downloads
 * @property {Number} totalCompletedFiles Total number of completed files
 * @property {Number} totalFiles Total number of files
 */

/**
 * Renders a `DownloadHeader` component
 * @param {DownloadHeaderProps} props
 *
 * @example <caption>Renders a `DownloadHeader` component</caption>
 * return (
 *   <DownloadHeader
 *     allDownloadsCompleted={allDownloadsCompleted}
 *     allDownloadsPaused={allDownloadsPaused}
 *     state={derivedStateFromDownloads}
 *     totalCompletedFiles={totalCompletedFiles}
 *     totalFiles={totalFiles}
 *   />
 * )
 */
const DownloadHeader = ({
  allDownloadsCompleted,
  allDownloadsPaused,
  state,
  totalCompletedFiles,
  totalFiles
}) => {
  const appContext = useAppContext()
  const {
    deleteAllToastsById
  } = appContext
  const {
    cancelDownloadItem,
    pauseDownloadItem,
    resumeDownloadItem
  } = useContext(ElectronApiContext)

  const onCancelDownloadItem = () => {
    cancelDownloadItem({})
    deleteAllToastsById()
  }

  const onPauseDownloadItem = () => {
    pauseDownloadItem({})
  }

  const onResumeDownloadItem = () => {
    resumeDownloadItem({})
  }

  return (
    <div
      className={
        classNames([
          styles.listHeader,
          styles[createVariantClassName(state)]
        ])
      }
    >
      <div className={styles.listHeaderPrimary}>
        {
          state === downloadStates.active && (
            <FaSpinner
              className={
                classNames([
                  styles.derivedStatusIcon,
                  styles.spinner
                ])
              }
            />
          )
        }
        {
          state === downloadStates.paused && (
            <FaPause className={styles.derivedStatusIcon} />
          )
        }
        {
          state === downloadStates.completed && (
            <FaCheckCircle className={styles.derivedStatusIcon} />
          )
        }
        <span className={styles.derivedStatus}>
          {
            state === downloadStates.active && (
              getHumanizedDownloadStates(downloadStates.active)
            )
          }
          {
            state === downloadStates.paused && (
              getHumanizedDownloadStates(downloadStates.paused)
            )
          }
          {
            state === downloadStates.completed && (
              getHumanizedDownloadStates(downloadStates.completed)
            )
          }
        </span>
        <span className={styles.humanizedStatus}>
          {totalCompletedFiles}
          {' '}
          of
          {' '}
          {totalFiles}
          {' '}
          files done
        </span>
      </div>
      <div className={styles.listHeaderSecondary}>
        {
          !allDownloadsCompleted
            ? (
              <>
                {
                  !allDownloadsPaused
                    ? (
                      <Button
                        className={styles.headerButton}
                        size="sm"
                        Icon={FaPause}
                        onClick={onPauseDownloadItem}
                      >
                        Pause All
                      </Button>
                    )
                    : (
                      <Button
                        className={styles.headerButton}
                        size="sm"
                        Icon={FaPlay}
                        onClick={onResumeDownloadItem}
                      >
                        Resume All
                      </Button>
                    )
                }
                <Button
                  className={styles.headerButton}
                  size="sm"
                  Icon={FaBan}
                  variant="danger"
                  onClick={onCancelDownloadItem}
                >
                  Cancel All
                </Button>
              </>
            )
            : (
              <Button
                className={styles.headerButton}
                size="sm"
                Icon={FaBan}
                variant="danger"
                onClick={onCancelDownloadItem}
              >
                Clear Downloads
              </Button>
            )
        }
      </div>
    </div>
  )
}

DownloadHeader.propTypes = {
  allDownloadsCompleted: PropTypes.bool.isRequired,
  allDownloadsPaused: PropTypes.bool.isRequired,
  state: PropTypes.string.isRequired,
  totalCompletedFiles: PropTypes.number.isRequired,
  totalFiles: PropTypes.number.isRequired
}

export default DownloadHeader
