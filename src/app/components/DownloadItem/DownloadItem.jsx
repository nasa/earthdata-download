import React, {
  useContext,
  useEffect,
  useState
} from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import {
  FaCheckCircle,
  FaExclamationCircle,
  FaInfoCircle,
  FaSignInAlt,
  FaSpinner
} from 'react-icons/fa'
import humanizeDuration from 'humanize-duration'

import Button from '../Button/Button'
import Dropdown from '../Dropdown/Dropdown'
import Progress from '../Progress/Progress'

import Tooltip from '../Tooltip/Tooltip'

import Dialog from '../Dialog/Dialog'
import WaitingForLogin from '../../dialogs/WaitingForLogin/WaitingForLogin'
import WaitingForEula from '../../dialogs/WaitingForEula/WaitingForEula'

import downloadStates from '../../constants/downloadStates'
import getHumanizedDownloadStates from '../../constants/humanizedDownloadStates'

import commafy from '../../utils/commafy'
import createVariantClassName from '../../utils/createVariantName'

import { ElectronApiContext } from '../../context/ElectronApiContext'
import { PAGES } from '../../constants/pages'

import * as styles from './DownloadItem.module.scss'

/**
 * @typedef {Object} DownloadItemProps
 * @property {String} downloadName The name of the DownloadItem.
 * @property {Boolean} hasErrors Does this download item have errors.
 * @property {Boolean} loadingMoreFiles Is EDD loading more download files.
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
 *     loadingMoreFiles,
 *     progress={progress}
 *     state={state}
 *     actionsList={actionsList},
 *   />
 * )
 */
const DownloadItem = ({
  actionsList,
  downloadName,
  hasErrors,
  loadingMoreFiles,
  progress,
  setCurrentPage,
  state
}) => {
  const {
    showWaitingForEulaDialog,
    showWaitingForLoginDialog,
    startReportingFiles
  } = useContext(ElectronApiContext)

  const [waitingForEulaDialogIsOpen, setWaitingForEulaDialogIsOpen] = useState(false)
  const [waitingForLoginDialogIsOpen, setWaitingForLoginDialogIsOpen] = useState(false)

  const onShowWaitingForEulaDialog = (event, info) => {
    const { showDialog } = info
    setWaitingForEulaDialogIsOpen(showDialog)
  }

  const onShowWaitingForLoginDialog = (event, info) => {
    const { showDialog } = info
    setWaitingForLoginDialogIsOpen(showDialog)
  }

  const onSelectDownloadItem = () => {
    if (state !== downloadStates.starting && state !== downloadStates.pending) {
      startReportingFiles({ downloadName })
      setCurrentPage(PAGES.fileDownloads)
    }
  }

  // Setup event listeners
  useEffect(() => {
    showWaitingForEulaDialog(true, onShowWaitingForEulaDialog)
    showWaitingForLoginDialog(true, onShowWaitingForLoginDialog)

    return () => {
      showWaitingForEulaDialog(false, onShowWaitingForEulaDialog)
      showWaitingForLoginDialog(false, onShowWaitingForLoginDialog)
    }
  }, [])

  const {
    percent = 0,
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
            <Button
              className={styles.action}
              key={action.label}
              size="sm"
              Icon={action.icon}
              hideLabel
              onClick={
                (event) => {
                // Stop the parent div's click event from going off
                  event.stopPropagation()
                  action.callback()
                }
              }
              variant={action.variant}
              dataTestId={`download-item-${action.label}`}
              tooltipDelayDuration={300}
            >
              {action.label}
            </Button>
          )
        )
      })
    })
  }

  const shouldShowProgress = (state !== downloadStates.pending)
    && (
      percent > 0
      || (
        state !== downloadStates.waitingForEula
        && state !== downloadStates.waitingForAuth
      )
    )

  const shouldShowTime = state !== downloadStates.pending
    && state !== downloadStates.waitingForEula
    && state !== downloadStates.waitingForAuth
    && totalFiles > 0

  let stateForClassName = state

  if (state === downloadStates.waitingForAuth && percent === 0) {
    // If waitingForAuth and no progress has been made, show the `pending` state
    stateForClassName = downloadStates.pending
  } else if (state === downloadStates.waitingForAuth) {
    // If waitingForAuth and some progress has been made, show the `interrupted` state
    stateForClassName = downloadStates.interrupted
  }

  return (
    <li
      className={
        classNames([
          styles.wrapper,
          styles[createVariantClassName(stateForClassName)]
        ])
      }
      data-testid="download-item"
    >
      <Dialog
        open={waitingForEulaDialogIsOpen}
        setOpen={setWaitingForEulaDialogIsOpen}
        showTitle
        closeButton
        title="Accept the license agreement to continue your download."
        TitleIcon={FaSignInAlt}
      >
        <WaitingForEula
          downloadId={downloadName}
        />
      </Dialog>
      <Dialog
        open={waitingForLoginDialogIsOpen}
        setOpen={setWaitingForLoginDialogIsOpen}
        showTitle
        closeButton
        title="You must log in with Earthdata Login to download this data."
        TitleIcon={FaSignInAlt}
      >
        <WaitingForLogin
          downloadId={downloadName}
        />
      </Dialog>
      <div
        data-testid="download-item-open-file-downloads"
        className={styles.innerWrapper}
        onClick={onSelectDownloadItem}
        onKeyDown={
          (event) => {
            // If the enter key or the Spacebar key is pressed
            if (event.key === 'Enter' || event.key === ' ') {
              onSelectDownloadItem()
            }
          }
        }
        role="button"
        tabIndex="0"
      >
        <h3
          className={styles.name}
          data-testid="download-item-name"
        >
          {downloadName}
        </h3>
        <div className={styles.meta}>
          <div className={styles.metaPrimary}>
            {
              shouldShowProgress && (
                <div
                  className={styles.percentComplete}
                  data-testid="download-item-percent"
                >
                  {percent}
                  %
                </div>
              )
            }
            {
              getHumanizedDownloadStates(state, percent, hasErrors) && (
                <div
                  className={styles.displayStatus}
                  data-testid="download-item-state"
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
                        data-testid="download-item-spinner"
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
                        data-testid="download-item-error"
                      />
                    )
                  }
                  {getHumanizedDownloadStates(state, percent, hasErrors)}
                </div>
              )
            }
            {
              (state !== downloadStates.pending && state !== downloadStates.error) && (
                <div
                  className={styles.statusDescription}
                  data-testid="download-item-status-description"
                >
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
            {
              state === downloadStates.error && (
                <div
                  className={styles.statusDescription}
                  data-testid="download-item-status-description"
                >
                  <FaInfoCircle />
                  {' '}
                  More Info
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
    </li>
  )
}

DownloadItem.defaultProps = {
  actionsList: null,
  hasErrors: false,
  loadingMoreFiles: false
}

DownloadItem.propTypes = {
  actionsList: PropTypes.arrayOf(
    PropTypes.arrayOf(
      PropTypes.shape({
        label: PropTypes.string.isRequired,
        isActive: PropTypes.bool.isRequired,
        isPrimary: PropTypes.bool.isRequired,
        variant: PropTypes.string,
        callback: PropTypes.func.isRequired,
        icon: PropTypes.func.isRequired,
        disabled: PropTypes.bool
      })
    )
  ),
  downloadName: PropTypes.string.isRequired,
  hasErrors: PropTypes.bool,
  loadingMoreFiles: PropTypes.bool,
  progress: PropTypes.shape({
    percent: PropTypes.number,
    finishedFiles: PropTypes.number,
    totalFiles: PropTypes.number,
    totalTime: PropTypes.number
  }).isRequired,
  setCurrentPage: PropTypes.func.isRequired,
  state: PropTypes.string.isRequired
}

export default DownloadItem
