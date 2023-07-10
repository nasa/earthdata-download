import React, { useContext, useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import {
  FaCheckCircle,
  FaInfoCircle,
  FaSignInAlt,
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
import getHumanizedDownloadStates from '../../constants/humanizedDownloadStates'

import { ElectronApiContext } from '../../context/ElectronApiContext'

import commafy from '../../utils/commafy'
import Dialog from '../Dialog/Dialog'
import WaitingForLogin from '../../dialogs/InitializeDownload/WaitingForLogin'

/**
 * @typedef {Object} DownloadItemProps
 * @property {String} downloadName The name of the DownloadItem.
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
  downloadName,
  loadingMoreFiles,
  progress,
  state,
  actionsList
}) => {
  const {
    showWaitingForLoginDialog
  } = useContext(ElectronApiContext)

  const [waitingForLoginDialogIsOpen, setWaitingForLoginDialogIsOpen] = useState(false)

  const onShowWaitingForLoginDialog = (event, info) => {
    const { showDialog } = info
    setWaitingForLoginDialogIsOpen(showDialog)
  }

  // Setup event listeners
  useEffect(() => {
    showWaitingForLoginDialog(true, onShowWaitingForLoginDialog)

    return () => {
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
              onClick={action.callback}
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
    && (percent > 0 || state !== downloadStates.waitingForAuth)

  const shouldShowTime = state !== downloadStates.pending
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
        open={waitingForLoginDialogIsOpen}
        setOpen={setWaitingForLoginDialogIsOpen}
        showTitle
        title="You must log in with Earthdata Login to download this data."
        TitleIcon={FaSignInAlt}
      >
        <WaitingForLogin
          downloadId={downloadName}
          // TODO EDD-13, might want to be able to send a fileId as well
          // fileId={fileId}
        />
      </Dialog>
      <div
        className={styles.innerWrapper}
        onClick={() => {}}
        onKeyDown={() => {}}
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
              getHumanizedDownloadStates(state, percent) && (
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
                  {getHumanizedDownloadStates(state, percent)}
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
                            content="This download requires authentication with Earthdata Login. If your browser did not automatically open, click Log In"
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
  actionsList: null,
  loadingMoreFiles: false
}

DownloadItem.propTypes = {
  downloadName: PropTypes.string.isRequired,
  progress: PropTypes.shape({
    percent: PropTypes.number,
    finishedFiles: PropTypes.number,
    totalFiles: PropTypes.number,
    totalTime: PropTypes.number
  }).isRequired,
  loadingMoreFiles: PropTypes.bool,
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
