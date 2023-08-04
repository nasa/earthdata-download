import React, { useContext } from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import {
  FaBan,
  FaCheckCircle,
  FaClipboard,
  FaFolderOpen,
  FaSpinner,
  FaInfoCircle
} from 'react-icons/fa'
import humanizeDuration from 'humanize-duration'
import Button from '../Button/Button'
import Dropdown from '../Dropdown/Dropdown'
import Progress from '../Progress/Progress'

import createVariantClassName from '../../utils/createVariantName'
import convertBytes from '../../utils/convertBytes'

import downloadStates from '../../constants/downloadStates'
import getHumanizedDownloadStates from '../../constants/humanizedDownloadStates'

import { ElectronApiContext } from '../../context/ElectronApiContext'

import * as styles from './FileDownloadsList.module.scss'
/**
 * @typedef {Object} FileDownloadsListProps
 * @property {function} fileDownloadsReport The file data to render the page from.
 * @property {function} hideCompleted Boolean whether to hide completed file downloads.

/**
 * Renders a FileDownloads
 * @param {FileDownloadsListProps} props
 *
 * @example <caption>Render a FileDownloadsList component.</caption>
 *
 * return (
 *   <FileDownloadsList
 *     fileDownloadsReport={fileDownloadsReport}
 *     hideCompleted={hideCompleted}
 *   />
 * )
 */
const FileDownloadsList = ({
  fileDownloadsProgressReport,
  hideCompleted
}) => {
  const {
    cancelDownloadItem,
    copyDownloadPath,
    openDownloadFolder,
    restartDownload
  } = useContext(ElectronApiContext)

  const onCancelDownloadItem = (downloadId, filename) => {
    cancelDownloadItem({
      downloadId,
      filename
    })
  }

  const onOpenDownloadFolder = (downloadId, filename) => {
    openDownloadFolder({
      downloadId,
      filename
    })
  }

  const onCopyDownloadPath = (downloadId, filename) => {
    copyDownloadPath({
      downloadId,
      filename
    })
  }

  const onRestartDownload = (downloadId, filename) => {
    restartDownload({
      downloadId,
      filename
    })
  }

  const isNotCompleted = (downloadFile) => downloadFile.state !== downloadStates.completed

  let filteredFiles = fileDownloadsProgressReport

  if (hideCompleted) filteredFiles = fileDownloadsProgressReport.filter(isNotCompleted)

  return (
    <>
      {
        filteredFiles.map((fileDownload) => {
          const {
            downloadId,
            filename,
            state,
            percent,
            receivedBytes,
            totalBytes,
            remainingTime
          } = fileDownload

          const shouldShowCancel = [
            downloadStates.pending,
            downloadStates.paused,
            downloadStates.active,
            downloadStates.error,
            downloadStates.interrupted
          ].includes(state)

          // Disable copy filepath if the download has not completed.
          const shouldDisableCopyFilePath = state !== downloadStates.completed

          // Disable open file if the download has not completed.
          const shouldDisableOpenFile = state !== downloadStates.completed

          const shouldDisableFileRestart = state === downloadStates.starting
         && state === downloadStates.pending

          const stateForClassName = state
          const isComplete = state === downloadStates.completed
          const shouldShowProgress = (state !== downloadStates.pending)
                        && (percent > 0)

          // Show the time if the file is not pending or completed.
          const shouldShowTime = state !== downloadStates.pending
        && state !== downloadStates.completed && state !== downloadStates.cancelled && remainingTime

          const shouldShowBytes = receivedBytes !== 0 && state !== downloadStates.cancelled
        && state !== downloadStates.pending

          const humanizedDownloadState = getHumanizedDownloadStates(state, percent)

          const actionsList = [
            [
              {
                label: 'Cancel File',
                isActive: shouldShowCancel,
                isPrimary: !isComplete,
                variant: 'danger',
                callback: () => onCancelDownloadItem(downloadId, filename),
                icon: FaBan
              }
            ],
            [
              {
                label: 'Open File',
                isActive: !shouldDisableOpenFile,
                isPrimary: isComplete,
                callback: () => onOpenDownloadFolder(downloadId, filename),
                icon: FaFolderOpen
              },
              {
                label: 'Copy File Path',
                isActive: !shouldDisableCopyFilePath,
                isPrimary: isComplete,
                callback: () => onCopyDownloadPath(downloadId, filename),
                icon: FaClipboard
              },
              {
                label: 'Restart File',
                isActive: !shouldDisableFileRestart,
                isPrimary: false,
                callback: () => onRestartDownload(downloadId, filename),
                icon: FaInfoCircle
              }
            ]
          ]

          // Render the actionsList
          let primaryActions = []

          if (actionsList) {
            actionsList.forEach((actionGroup) => {
              actionGroup.forEach((action) => {
                primaryActions = [
                  ...primaryActions,
                  (action.isActive && action.isPrimary) && (
                    <Button
                      className={styles.action}
                      key={action.label}
                      size="sm"
                      Icon={action.icon}
                      hideLabel
                      onClick={action.callback}
                      variant={action.variant}
                      tooltipDelayDuration={300}
                    >
                      {action.label}
                    </Button>
                  )
                ]
              })
            })
          }

          // Render each file download
          return (
            <div
              key={fileDownload.id}
              className={
                classNames([
                  styles.wrapper,
                  styles[createVariantClassName(stateForClassName)]
                ])
              }
              data-testid="download-item"
            >
              <div className={styles.innerWrapper}>
                <h3
                  className={styles.name}
                >
                  {filename}
                </h3>
                <div className={styles.meta}>
                  <div className={styles.metaPrimary}>
                    {
                      shouldShowProgress && (
                        <div
                          className={styles.percentComplete}
                        >
                          {percent}
                          %
                        </div>
                      )
                    }
                    {
                      humanizedDownloadState && (
                        <div
                          className={styles.displayStatus}
                        >
                          {
                            state === state.active && (
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
                            state === state.completed && (
                              <FaCheckCircle className={styles.statusDescriptionIcon} />
                            )
                          }
                          {humanizedDownloadState}
                        </div>
                      )
                    }
                    {
                      state !== state.pending && (
                        <div
                          className={styles.statusDescription}
                        >
                          <p
                            className={styles.statusInformation}
                            data-testid="file-downloads-list-time-remaining"
                          >
                            {
                              (
                                shouldShowTime && (
                                  <>
                                    {' '}
                                    {remainingTime ? humanizeDuration(remainingTime * 1000) : ''}
                                    {' '}
                                    remaining
                                    {' '}
                                  </>
                                )
                              )
                            }
                          </p>
                          {
                            shouldShowBytes && (
                              <i
                                className={styles.statusInformationByteStats}
                                data-testid="file-downloads-list-bytes-remaining"
                              >
                                {convertBytes(receivedBytes)}
                                /
                                {convertBytes(totalBytes)}
                                {' '}
                                downloaded
                              </i>
                            )
                          }
                        </div>
                      )
                    }
                  </div>
                  <div className={styles.metaSecondary}>
                    {primaryActions}
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
              <div />
            </div>
          )
        })
      }
    </>
  )
}

FileDownloadsList.defaultProps = {
  fileDownloadsProgressReport: []
}

FileDownloadsList.propTypes = {

  fileDownloadsProgressReport: PropTypes.arrayOf(
    PropTypes.shape({
      downloadId: PropTypes.string.isRequired,
      filename: PropTypes.string.isRequired,
      percent: PropTypes.number,
      receivedBytes: PropTypes.number,
      state: PropTypes.string.isRequired,
      timeStart: PropTypes.number,
      totalBytes: PropTypes.number
    })
  ),
  hideCompleted: PropTypes.bool.isRequired
}

export default FileDownloadsList
