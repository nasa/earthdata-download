import React, {
  useContext,
  useEffect,
  useState
} from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import { FaSignInAlt } from 'react-icons/fa'

import Button from '../Button/Button'
import Dropdown from '../Dropdown/Dropdown'
import Progress from '../Progress/Progress'

import Dialog from '../Dialog/Dialog'
import WaitingForLogin from '../../dialogs/WaitingForLogin/WaitingForLogin'
import WaitingForEula from '../../dialogs/WaitingForEula/WaitingForEula'

import downloadStates from '../../constants/downloadStates'

import createVariantClassName from '../../utils/createVariantClassName'

import { ElectronApiContext } from '../../context/ElectronApiContext'
import { PAGES } from '../../constants/pages'

import * as styles from './DownloadItem.module.scss'

/**
 * @typedef {Object} DownloadItemProps
 * @property {String} downloadId The name of the DownloadItem.
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
 *     downloadId={downloadId}
 *     loadingMoreFiles,
 *     progress={progress}
 *     state={state}
 *     actionsList={actionsList},
 *   />
 * )
 */
const DownloadItem = ({
  actionsList,
  downloadId,
  itemName,
  percent,
  setCurrentPage,
  state,
  status
}) => {
  const {
    showWaitingForEulaDialog,
    showWaitingForLoginDialog,
    startReportingFiles
  } = useContext(ElectronApiContext)

  const {
    primary: primaryStatus,
    secondary: secondaryStatus,
    tertiary: tertiaryStatus
  } = status

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

  const shouldBeClickable = !!setCurrentPage
    && state !== downloadStates.starting
    && state !== downloadStates.pending

  const onSelectDownloadItem = () => {
    if (shouldBeClickable) {
      startReportingFiles({ downloadId })
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
              onClick={
                (event) => {
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
        ]
      })
    })
  }

  let stateForClassName = state

  if (
    (state === downloadStates.waitingForAuth || state === downloadStates.waitingForEula)
    && percent === 0
  ) {
    // If waitingForAuth and no progress has been made, show the `pending` state
    stateForClassName = downloadStates.pending
  } else if (state === downloadStates.waitingForAuth || state === downloadStates.waitingForEula) {
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
      {/* ?? Should these dialogs be present on files view? */}
      <Dialog
        open={waitingForEulaDialogIsOpen}
        setOpen={setWaitingForEulaDialogIsOpen}
        showTitle
        closeButton
        title="Accept the license agreement to continue your download."
        TitleIcon={FaSignInAlt}
      >
        <WaitingForEula
          downloadId={downloadId}
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
          downloadId={downloadId}
        />
      </Dialog>

      <div
        data-testid="download-item-open-file-downloads"
        className={
          classNames([
            styles.innerWrapper,
            { [styles.isClickable]: shouldBeClickable }
          ])
        }
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
          {itemName}
        </h3>

        <div className={styles.meta}>
          <div className={styles.metaPrimary}>
            {primaryStatus}
            {secondaryStatus}
            {tertiaryStatus}
            {/* {
              // TODO EDD-27?
              state === downloadStates.error && (
                <div
                  className={styles.statusDescription}
                >
                  <FaInfoCircle />
                  {' '}
                  More Info
                </div>
              )
            } */}
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

        <div
          style={{ width: `${percent}%` }}
          className={styles.progressBackground}
        />
      </div>
    </li>
  )
}

DownloadItem.defaultProps = {
  actionsList: null,
  setCurrentPage: null,
  status: {}
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
  downloadId: PropTypes.string.isRequired,
  itemName: PropTypes.string.isRequired,
  percent: PropTypes.number.isRequired,
  setCurrentPage: PropTypes.func,
  state: PropTypes.string.isRequired,
  status: PropTypes.shape({
    primary: PropTypes.node,
    secondary: PropTypes.node,
    tertiary: PropTypes.node
  })
}

export default DownloadItem
