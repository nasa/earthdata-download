import React, {
  useContext,
  useEffect,
  useState
} from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import { FaSignInAlt } from 'react-icons/fa'

import Dropdown from '../Dropdown/Dropdown'
import Progress from '../Progress/Progress'
import DownloadItemActionButton from './DownloadItemActionButton'

import Dialog from '../Dialog/Dialog'
import WaitingForLogin from '../../dialogs/WaitingForLogin/WaitingForLogin'
import WaitingForEula from '../../dialogs/WaitingForEula/WaitingForEula'

import downloadStates from '../../constants/downloadStates'

import createVariantClassName from '../../utils/createVariantClassName'

import { ElectronApiContext } from '../../context/ElectronApiContext'
import { PAGES } from '../../constants/pages'

import useAccessibleEvent from '../../hooks/useAccessibleEvent'

import * as styles from './DownloadItem.module.scss'

/**
 * @typedef {Object} DownloadItemProps
 * @property {Array} actionsList A 2-D array of objects detailing action attributes.
 * @property {String} downloadId The ID of the DownloadItem.
 * @property {Boolean} isFile Is the DownloadItem rendering a file item.
 * @property {String} itemName The name of the DownloadItem.
 * @property {Number} percent The download percent of the DownloadItem.
 * @property {Function} setCurrentPage A function which sets the active page.
 * @property {Function} setSelectedDownloadId A function which sets the setSelectedDownloadId.
 * @property {Boolean} shouldBeClickable Should the DownloadItem be clickable.
 * @property {String} state The state of the DownloadItem.
 * @property {Object} primaryStatus Component for the primary status of the DownloadItem.
 * @property {Object} secondaryStatus Component for the secondary status of the DownloadItem.
 * @property {Object} tertiaryStatus Component for the tertiary status of the DownloadItem.
 * @property {Object} subStatus Component for the sub status of the DownloadItem.
 * @property {Object} moreInfo Component for a 'More Info' link on the DownloadItem.
 */

/**
 * Renders a DownloadItem
 * @param {DownloadItemProps} props
 *
 * @example <caption>Render a DownloadItem.</caption>
 *
 * return (
 *   <DownloadItem
 *     actionsList={actionsList}
 *     downloadId={downloadId}
 *     itemName={filename}
 *     percent={percent}
 *     setCurrentPage={setCurrentPage}
 *     state={state}
 *     primaryStatus={(<PrimaryStatus ... />)}
 *     secondaryStatus={(<SecondaryStatus ... />)}
 *     tertiaryStatus={(<TertiaryStatus ... />)}
 *   />
 * )
 */
const DownloadItem = ({
  actionsList,
  downloadId,
  isFile,
  itemName,
  percent,
  setCurrentPage,
  setSelectedDownloadId,
  shouldBeClickable,
  state,
  primaryStatus,
  secondaryStatus,
  tertiaryStatus,
  subStatus,
  moreInfo
}) => {
  const {
    showWaitingForEulaDialog,
    showWaitingForLoginDialog
  } = useContext(ElectronApiContext)

  const [waitingForEulaDialogIsOpen, setWaitingForEulaDialogIsOpen] = useState(false)
  const [waitingForLoginDialogIsOpen, setWaitingForLoginDialogIsOpen] = useState(false)
  const [moreActionsOpen, setMoreActionsOpen] = useState(false)

  const onShowWaitingForEulaDialog = (event, info) => {
    const { showDialog } = info
    setWaitingForEulaDialogIsOpen(showDialog)
  }

  const onShowWaitingForLoginDialog = (event, info) => {
    const { showDialog } = info
    setWaitingForLoginDialogIsOpen(showDialog)
  }

  const onSelectDownloadItem = () => {
    if (shouldBeClickable) {
      setSelectedDownloadId(downloadId)
      setCurrentPage(PAGES.fileDownloads)
    }
  }

  const accessibleEventProps = useAccessibleEvent((event) => {
    onSelectDownloadItem()
    event.stopPropagation()
  })

  // Setup event listeners
  useEffect(() => {
    if (!isFile) {
      showWaitingForEulaDialog(true, onShowWaitingForEulaDialog)
      showWaitingForLoginDialog(true, onShowWaitingForLoginDialog)
    }

    return () => {
      if (!isFile) {
        showWaitingForEulaDialog(false, onShowWaitingForEulaDialog)
        showWaitingForLoginDialog(false, onShowWaitingForLoginDialog)
      }
    }
  }, [])

  let primaryActions = []

  if (actionsList) {
    actionsList.forEach((actionGroup) => {
      actionGroup.forEach((action) => {
        primaryActions = [
          ...primaryActions,
          (action.isActive && action.isPrimary) && (
            <DownloadItemActionButton
              key={action.label}
              label={action.label}
              callback={action.callback}
              buttonProps={
                {
                  className: styles.action,
                  size: 'sm',
                  Icon: action.icon,
                  hideLabel: true,
                  variant: action.variant,
                  dataTestId: `download-item-${action.label}`,
                  tooltipDelayDuration: 300
                }
              }
            />
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
  } else if (state === downloadStates.errorFetchingLinks) {
    stateForClassName = downloadStates.error
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
      {/* TODO Refactor: Move these dialogs to Layout */}
      {
        !isFile && (
          <>
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
          </>
        )
      }

      <div
        data-testid="download-item-open-file-downloads"
        className={
          classNames([
            styles.innerWrapper,
            { [styles.isClickable]: shouldBeClickable },
            { [styles.isDropdownActive]: moreActionsOpen }
          ])
        }
        role="button"
        tabIndex="0"
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...accessibleEventProps}
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
            {moreInfo}
          </div>

          {
            actionsList && (
              <div className={styles.metaSecondary}>
                {primaryActions}
                <Dropdown
                  onOpenChange={setMoreActionsOpen}
                  actionsList={actionsList}
                />
              </div>
            )
          }
        </div>

        {
          subStatus && (
            <div className={styles.subMeta}>
              <div className={styles.metaPrimary}>
                {subStatus}
              </div>
            </div>
          )
        }

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
  isFile: false,
  setCurrentPage: null,
  setSelectedDownloadId: null,
  shouldBeClickable: false,
  primaryStatus: null,
  secondaryStatus: null,
  tertiaryStatus: null,
  subStatus: null,
  moreInfo: null
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
        disabled: PropTypes.bool
      })
    )
  ),
  downloadId: PropTypes.string.isRequired,
  isFile: PropTypes.bool,
  itemName: PropTypes.string.isRequired,
  percent: PropTypes.number.isRequired,
  setCurrentPage: PropTypes.func,
  setSelectedDownloadId: PropTypes.func,
  shouldBeClickable: PropTypes.bool,
  state: PropTypes.string.isRequired,
  primaryStatus: PropTypes.node,
  secondaryStatus: PropTypes.node,
  tertiaryStatus: PropTypes.node,
  subStatus: PropTypes.node,
  moreInfo: PropTypes.node
}

export default DownloadItem
