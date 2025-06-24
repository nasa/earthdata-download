import React, {
  useContext,
  useEffect,
  useState
} from 'react'
import classNames from 'classnames'
import {
  FaCog,
  FaDownload,
  FaExclamationCircle,
  FaSignInAlt,
  FaCheck,
  FaBan,
  FaTrash
} from 'react-icons/fa'
import {
  VscChromeRestore,
  VscChromeMaximize,
  VscChromeMinimize,
  VscChromeClose
} from 'react-icons/vsc'

import Button from '../Button/Button'
import Dialog from '../Dialog/Dialog'
import DownloadHistory from '../../pages/DownloadHistory/DownloadHistory'
import Downloads from '../../pages/Downloads/Downloads'
import FileDownloads from '../../pages/FileDownloads/FileDownloads'
import Settings from '../../dialogs/Settings/Settings'
import ToastList from '../ToastList/ToastList'
import InitializeDownload from '../../dialogs/InitializeDownload/InitializeDownload'
import MoreErrorInfo from '../../dialogs/MoreErrorInfo/MoreErrorInfo'

import { ElectronApiContext } from '../../context/ElectronApiContext'

import useAppContext from '../../hooks/useAppContext'

import { PAGES } from '../../constants/pages'

import AdditionalDetails from '../../dialogs/AdditionalDetails/AdditionalDetails'
import WaitingForEula from '../../dialogs/WaitingForEula/WaitingForEula'
import WaitingForLogin from '../../dialogs/WaitingForLogin/WaitingForLogin'
import ResetApplication from '../../dialogs/ResetApplication/ResetApplication'

import * as styles from './Layout.module.scss'

const updateAvailableToastId = 'updateAvailable'

/**
 * Renders a `Layout` page.
 *
 * @example <caption>Render a Layout component.</caption>
 *
 * return (
 *   <Layout />
 * )
 */
const Layout = () => {
  const {
    autoUpdateAvailable,
    autoUpdateInstallLater,
    autoUpdateProgress,
    autoUpdateError,
    beginDownload,
    closeWindow,
    initializeDownload,
    isLinux,
    isMac,
    isWin,
    maximizeWindow,
    minimizeWindow,
    setDownloadLocation,
    setPreferenceFieldValue,
    getPreferenceFieldValue,
    showWaitingForEulaDialog,
    showWaitingForLoginDialog,
    windowsLinuxTitleBar
  } = useContext(ElectronApiContext)

  const appContext = useAppContext()
  const {
    toasts,
    addToast,
    dismissToast
  } = appContext
  const { activeToasts = {} } = toasts

  const [activeMoreInfoDownloadInfo, setActiveMoreInfoDownloadInfo] = useState({})
  const [activeAdditionalDetailsInfo, setActiveAdditionalDetailsInfo] = useState({})
  const [chooseDownloadLocationIsOpen, setChooseDownloadLocationIsOpen] = useState(false)
  const [currentPage, setCurrentPage] = useState(PAGES.downloads)
  const [downloadIds, setDownloadIds] = useState(null)
  const [downloadLinks, setDownloadLinks] = useState({})
  const [hasActiveDownload, setHasActiveDownload] = useState(false)
  const [isWindowMaximized, setIsWindowMaximized] = useState(false)
  const [additionalDetailsIsOpen, setAdditionalDetailsIsOpen] = useState(false)
  const [moreErrorInfoIsOpen, setMoreErrorInfoIsOpen] = useState(false)
  const [pageComponent, setPageComponent] = useState(null)
  const [selectedDownloadId, setSelectedDownloadId] = useState(null)
  const [selectedDownloadLocation, setSelectedDownloadLocation] = useState(null)
  const [settingsDialogIsOpen, setSettingsDialogIsOpen] = useState(false)
  const [useDefaultLocation, setUseDefaultLocation] = useState(false)
  const [resetDialogOpen, setResetDialogOpen] = useState(false)
  const [waitingForEulaDialogIsOpen, setWaitingForEulaDialogIsOpen] = useState(false)
  const [waitingForLoginDialogIsOpen, setWaitingForLoginDialogIsOpen] = useState(false)
  const [waitingForDownloadId, setWaitingForDownloadId] = useState(null)

  const showMoreInfoDialog = ({
    downloadId,
    numberErrors,
    state
  }) => {
    setActiveMoreInfoDownloadInfo({
      downloadId,
      numberErrors,
      state
    })

    setMoreErrorInfoIsOpen(true)
  }

  const showAdditionalDetailsDialog = (downloadId) => {
    setActiveAdditionalDetailsInfo({ downloadId })
    setAdditionalDetailsIsOpen(true)
  }

  const onWindowMaximized = (event, windowMaximized) => {
    setIsWindowMaximized(windowMaximized)
  }

  const onDismissToast = (id) => {
    if (id === updateAvailableToastId) {
      autoUpdateInstallLater()
    }

    dismissToast(id)
  }

  // Add a toast when an app update is available
  const onAutoUpdateAvailable = () => {
    addToast({
      id: updateAvailableToastId,
      title: 'An app update is available',
      message: 'Downloading update: 0%',
      numberErrors: 0,
      variant: 'spinner'
    })
  }

  const onCloseChooseLocationDialog = () => {
    setChooseDownloadLocationIsOpen(false)
  }

  // Update the toast with the status as the download progresses
  const onAutoUpdateProgress = (event, info) => {
    const { percent } = info

    if (percent < 100) {
      addToast({
        id: updateAvailableToastId,
        title: 'An app update is available',
        message: `Downloading update: ${percent}%`,
        numberErrors: 0,
        variant: 'spinner'
      })
    } else {
      addToast({
        id: updateAvailableToastId,
        message: 'Update is ready to install',
        numberErrors: 0,
        variant: 'success'
      })

      setInterval(() => {
        dismissToast(updateAvailableToastId)
      }, 3000)
    }
  }

  const onAutoUpdateError = () => {
    addToast({
      id: 'auto-update-error',
      title: 'Auto-Update Failure',
      message: 'Failed to download latest update. Download new version manually',
      variant: 'error',
      actions: [
        {
          altText: 'Allow',
          buttonText: 'Manual Download',
          buttonProps: {
            Icon: FaDownload,
            onClick: () => window.open('https://nasa.github.io/earthdata-download/', '_blank')
          }
        }
      ]
    })
  }

  const metricsToastResponder = async (selection) => {
    onDismissToast('allow-metrics-id')

    if (selection === 'Settings') {
      setSettingsDialogIsOpen(true)

      return
    }

    setPreferenceFieldValue({
      field: 'hasMetricsPreferenceBeenSet',
      value: true
    })

    setPreferenceFieldValue({
      field: 'allowMetrics',
      value: selection
    })
  }

  const isMetricsPreferenceSet = async () => {
    const hasMetricsPreferenceBeenSet = await getPreferenceFieldValue('hasMetricsPreferenceBeenSet')

    return hasMetricsPreferenceBeenSet
  }

  const onInitializeDownload = async (event, info) => {
    const {
      downloadIds: newDownloadIds,
      downloadLocation: newDownloadLocation,
      links,
      shouldUseDefaultLocation
    } = info

    // Displaying Allow Metrics prompt if the user hasn't set a value
    const hasMetricsPreferenceBeenSet = await isMetricsPreferenceSet()
    if (!hasMetricsPreferenceBeenSet) {
      addToast({
        showCloseButton: false,
        id: 'allow-metrics-id',
        message: 'Send Anonymous Usage Data?',
        variant: 'none',
        actions: [
          {
            altText: 'Allow',
            buttonText: 'Yes',
            buttonProps: {
              Icon: FaCheck,
              onClick: () => metricsToastResponder(true)
            }
          },
          {
            altText: 'Opt-Out',
            buttonText: 'No',
            buttonProps: {
              Icon: FaBan,
              onClick: () => metricsToastResponder(false)
            }
          },
          {
            altText: 'Settings',
            buttonText: 'Settings',
            buttonProps: {
              Icon: FaCog,
              onClick: () => metricsToastResponder('Settings')
            }
          }
        ]
      })
    }

    setDownloadIds(newDownloadIds)
    setDownloadLinks({
      ...downloadLinks,
      [newDownloadIds]: links
    })

    setSelectedDownloadLocation(newDownloadLocation)
    setUseDefaultLocation(shouldUseDefaultLocation)
    // If shouldUseDefaultLocation is true, start the download(s)
    if (shouldUseDefaultLocation) {
      beginDownload({
        downloadIds: newDownloadIds,
        downloadLocation: newDownloadLocation,
        makeDefaultDownloadLocation: true
      })

      // Display a toast notification if a download is initialized
      // while current page is not Downloads
      if (currentPage !== PAGES.downloads) {
        newDownloadIds.forEach((downloadId) => {
          addToast({
            id: `new-download-${downloadId}`,
            title: 'Download started',
            message: downloadId,
            numberErrors: 0
          })
        })
      }
    } else {
      // Return to Downloads so that the set default location dialog can be displayed
      setCurrentPage(PAGES.downloads)
    }
  }

  // When a new downloadLocation has been selected from the main process, update the state
  const onSetDownloadLocation = (event, info) => {
    const { downloadLocation: newDownloadLocation } = info
    setSelectedDownloadLocation(newDownloadLocation)
  }

  const onShowWaitingForEulaDialog = (event, info) => {
    const {
      downloadId,
      showDialog
    } = info

    setWaitingForEulaDialogIsOpen(showDialog)
    setWaitingForDownloadId(downloadId)
  }

  const onShowWaitingForLoginDialog = (event, info) => {
    const {
      downloadId,
      showDialog
    } = info

    setWaitingForLoginDialogIsOpen(showDialog)
    setWaitingForDownloadId(downloadId)
  }

  useEffect(() => {
    switch (currentPage) {
      case PAGES.downloads:
        setSelectedDownloadId(null)
        setPageComponent(
          <Downloads
            downloadLinks={downloadLinks}
            hasActiveDownload={hasActiveDownload}
            showAdditionalDetailsDialog={showAdditionalDetailsDialog}
            setCurrentPage={setCurrentPage}
            setHasActiveDownload={setHasActiveDownload}
            setSelectedDownloadId={setSelectedDownloadId}
            showMoreInfoDialog={showMoreInfoDialog}
          />
        )

        break
      case PAGES.downloadHistory:
        setSelectedDownloadId(null)
        setPageComponent(
          <DownloadHistory
            showAdditionalDetailsDialog={showAdditionalDetailsDialog}
            setCurrentPage={setCurrentPage}
            showMoreInfoDialog={showMoreInfoDialog}
          />
        )

        break
      case PAGES.fileDownloads:
        setPageComponent(
          <FileDownloads
            key={selectedDownloadId}
            downloadId={selectedDownloadId}
            setCurrentPage={setCurrentPage}
            showMoreInfoDialog={showMoreInfoDialog}
          />
        )

        break
      default:
        break
    }
  }, [currentPage, selectedDownloadId])

  useEffect(() => {
    if (!useDefaultLocation && downloadIds) {
      setChooseDownloadLocationIsOpen(true)
    }
  }, [useDefaultLocation, downloadIds])

  useEffect(() => {
    windowsLinuxTitleBar(true, onWindowMaximized)
    autoUpdateAvailable(true, onAutoUpdateAvailable)
    autoUpdateProgress(true, onAutoUpdateProgress)
    autoUpdateError(true, onAutoUpdateError)
    setDownloadLocation(true, onSetDownloadLocation)
    showWaitingForEulaDialog(true, onShowWaitingForEulaDialog)
    showWaitingForLoginDialog(true, onShowWaitingForLoginDialog)

    return () => {
      windowsLinuxTitleBar(false, onWindowMaximized)
      autoUpdateAvailable(false, onAutoUpdateAvailable)
      autoUpdateProgress(false, onAutoUpdateProgress)
      autoUpdateError(false, onAutoUpdateError)
      setDownloadLocation(false, onSetDownloadLocation)
      showWaitingForEulaDialog(false, onShowWaitingForEulaDialog)
      showWaitingForLoginDialog(false, onShowWaitingForLoginDialog)
    }
  }, [])

  useEffect(() => {
    initializeDownload(true, onInitializeDownload)

    return () => {
      initializeDownload(false, onInitializeDownload)
    }
  }, [currentPage])

  const {
    downloadId: moreInfoDownloadId,
    numberErrors,
    state: moreInfoState
  } = activeMoreInfoDownloadInfo

  return (
    <div className={styles.wrapper}>
      <header
        data-testid="layout-header"
        className={
          classNames(
            [
              styles.header,
              {
                [styles.isMac]: isMac
              }
            ]
          )
        }
      >
        <nav className={styles.nav}>
          <Button
            className={
              classNames(
                [
                  styles.navButton,
                  {
                    [styles.isActive]: currentPage === PAGES.downloads
                  }
                ]
              )
            }
            onClick={() => setCurrentPage(PAGES.downloads)}
            type="button"
            dataTestId="layout-button-downloads"
          >
            Downloads
          </Button>

          <Button
            className={
              classNames(
                [
                  styles.navButton,
                  {
                    [styles.isActive]: currentPage === PAGES.downloadHistory
                  }
                ]
              )
            }
            onClick={() => setCurrentPage(PAGES.downloadHistory)}
            type="button"
            dataTestId="layout-button-downloadHistory"
          >
            Download History
          </Button>
        </nav>

        <section
          className={
            classNames(
              [
                {
                  [styles.actions]: isMac,
                  [styles.windowWrapper]: isWin || isLinux
                }
              ]
            )
          }
        >
          <Button
            className={styles.settingsButton}
            Icon={FaCog}
            onClick={() => setSettingsDialogIsOpen(true)}
          >
            Settings
          </Button>
        </section>

        {
          (isWin || isLinux) && (
            <div
              data-testid="window-buttons"
              className={styles.windowButtons}
            >
              <Button
                className={
                  classNames(
                    [
                      styles.minMaxCloseButton,
                      {
                        [styles.isLinux]: isLinux
                      }
                    ]
                  )
                }
                onClick={minimizeWindow}
                dataTestId="minimize-window"
                Icon={VscChromeMinimize}
                hideLabel
                hideTooltip
              >
                Minimize
              </Button>

              <Button
                className={
                  classNames(
                    [
                      styles.minMaxCloseButton,
                      {
                        [styles.isLinux]: isLinux
                      }
                    ]
                  )
                }
                onClick={maximizeWindow}
                dataTestId="maximize-restore-window"
                Icon={isWindowMaximized && isWin ? VscChromeRestore : VscChromeMaximize}
                hideLabel
                hideTooltip
              >
                Maximize/Restore
              </Button>

              <Button
                className={
                  classNames(
                    [
                      styles.minMaxCloseButton,
                      styles.windowClose,
                      {
                        [styles.isLinux]: isLinux
                      }
                    ]
                  )
                }
                onClick={closeWindow}
                dataTestId="close-window"
                Icon={VscChromeClose}
                hideLabel
                hideTooltip
              >
                Close
              </Button>
            </div>
          )
        }
      </header>

      <main className={styles.main}>
        {pageComponent}
        <ToastList
          className={styles.toastList}
          dismissToast={onDismissToast}
          toasts={Object.values(activeToasts).filter(Boolean)}
        />
        <Dialog
          open={settingsDialogIsOpen}
          setOpen={setSettingsDialogIsOpen}
          showTitle
          size="lg"
          title="Settings"
          closeButton
        >
          <Settings
            hasActiveDownloads={hasActiveDownload}
            defaultDownloadLocation={selectedDownloadLocation}
            setDefaultDownloadLocation={setSelectedDownloadLocation}
            settingsDialogIsOpen={settingsDialogIsOpen}
            setResetDialogOpen={setResetDialogOpen}
          />
        </Dialog>

        <Dialog
          open={chooseDownloadLocationIsOpen}
          setOpen={setChooseDownloadLocationIsOpen}
          showTitle
          title="Choose a download location"
          TitleIcon={FaDownload}
          onEscapeKeyDown={(event) => event.preventDefault()}
          onPointerDownOutside={(event) => event.preventDefault()}
          onInteractOutside={(event) => event.preventDefault()}
        >
          <InitializeDownload
            downloadIds={downloadIds}
            downloadLocation={selectedDownloadLocation}
            setDownloadIds={setDownloadIds}
            onCloseChooseLocationDialog={onCloseChooseLocationDialog}
          />
        </Dialog>

        <Dialog
          open={moreErrorInfoIsOpen}
          closeButton
          setOpen={setMoreErrorInfoIsOpen}
          showTitle
          title={`An error occurred in ${moreInfoDownloadId}`}
          TitleIcon={FaExclamationCircle}
        >
          <MoreErrorInfo
            downloadId={moreInfoDownloadId}
            numberErrors={numberErrors}
            state={moreInfoState}
            onCloseMoreErrorInfoDialog={setMoreErrorInfoIsOpen}
            setCurrentPage={setCurrentPage}
            setSelectedDownloadId={setSelectedDownloadId}
          />
        </Dialog>

        <Dialog
          open={additionalDetailsIsOpen}
          closeButton
          setOpen={setAdditionalDetailsIsOpen}
          showTitle
          title="Additional Details"
        >
          <AdditionalDetails
            activeAdditionalDetailsInfo={activeAdditionalDetailsInfo}
            onCloseAdditionalDetailsDialog={setAdditionalDetailsIsOpen}
            setActiveAdditionalDetailsInfo={setActiveAdditionalDetailsInfo}
          />
        </Dialog>

        <Dialog
          open={waitingForEulaDialogIsOpen}
          setOpen={setWaitingForEulaDialogIsOpen}
          showTitle
          closeButton
          title="Accept the license agreement to continue your download."
          TitleIcon={FaSignInAlt}
        >
          <WaitingForEula
            downloadId={waitingForDownloadId}
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
            downloadId={waitingForDownloadId}
          />
        </Dialog>

        <Dialog
          open={resetDialogOpen}
          setOpen={setResetDialogOpen}
          showTitle
          closeButton
          title="Are you sure you want to reset the application?"
          TitleIcon={FaTrash}
        >
          <ResetApplication />
        </Dialog>
      </main>
    </div>
  )
}

export default Layout
