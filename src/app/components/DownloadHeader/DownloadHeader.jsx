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

import * as styles from './DownloadHeader.module.scss'
import Button from '../Button/Button'
import { ElectronApiContext } from '../../context/ElectronApiContext'

const DownloadHeader = ({
  allDownloadsCompleted,
  allDownloadsPaused,
  derivedStateFromDownloads,
  totalCompletedFiles,
  totalDownloadFiles
}) => {
  const {
    cancelDownloadItem,
    pauseDownloadItem,
    resumeDownloadItem
  } = useContext(ElectronApiContext)

  const onCancelDownloadItem = () => {
    cancelDownloadItem({})
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
          styles[createVariantClassName(derivedStateFromDownloads)]
        ])
      }
    >
      <div className={styles.listHeaderPrimary}>
        {
          derivedStateFromDownloads === downloadStates.active && (
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
          derivedStateFromDownloads === downloadStates.paused && (
            <FaPause className={styles.derivedStatusIcon} />
          )
        }
        {
          derivedStateFromDownloads === downloadStates.completed && (
            <FaCheckCircle className={styles.derivedStatusIcon} />
          )
        }
        <span className={styles.derivedStatus}>
          {
            derivedStateFromDownloads === downloadStates.active && (
              getHumanizedDownloadStates(downloadStates.active)
            )
          }
          {
            derivedStateFromDownloads === downloadStates.paused && (
              getHumanizedDownloadStates(downloadStates.paused)
            )
          }
          {
            derivedStateFromDownloads === downloadStates.completed && (
              getHumanizedDownloadStates(downloadStates.completed)
            )
          }
        </span>
        <span className={styles.humanizedStatus}>
          {totalCompletedFiles}
          {' '}
          of
          {' '}
          {totalDownloadFiles}
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
  derivedStateFromDownloads: PropTypes.string.isRequired,
  totalCompletedFiles: PropTypes.number.isRequired,
  totalDownloadFiles: PropTypes.number.isRequired
}

export default DownloadHeader
