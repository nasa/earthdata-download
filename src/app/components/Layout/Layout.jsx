import React, {
  useContext,
  useEffect,
  useState
} from 'react'
import classNames from 'classnames'
import {
  FaCog,
  FaDownload,
  FaExclamationCircle
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
    beginDownload,
    initializeDownload,
    closeWindow,
    minimizeWindow,
    maximizeWindow,
    isMac,
    isWin,
    isLinux,
    setDownloadLocation,
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
  const [chooseDownloadLocationIsOpen, setChooseDownloadLocationIsOpen] = useState(false)
  const [currentPage, setCurrentPage] = useState(PAGES.downloads)
  const [downloadIds, setDownloadIds] = useState(null)
  const [hasActiveDownload, setHasActiveDownload] = useState(false)
  const [isWindowMaximized, setIsWindowMaximized] = useState(false)
  const [moreErrorInfoIsOpen, setMoreErrorInfoIsOpen] = useState()
  const [pageComponent, setPageComponent] = useState(null)
  const [selectedDownloadId, setSelectedDownloadId] = useState(null)
  const [selectedDownloadLocation, setSelectedDownloadLocation] = useState(null)
  const [settingsDialogIsOpen, setSettingsDialogIsOpen] = useState(false)
  const [useDefaultLocation, setUseDefaultLocation] = useState(false)

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

  const onInitializeDownload = (event, info) => {
    const {
      downloadIds: newDownloadIds,
      downloadLocation: newDownloadLocation,
      shouldUseDefaultLocation
    } = info

    setDownloadIds(newDownloadIds)
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
            id: downloadId,
            title: 'New Download',
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

  useEffect(() => {
    switch (currentPage) {
      case PAGES.downloads:
        setSelectedDownloadId(null)
        setPageComponent(
          <Downloads
            setSelectedDownloadId={setSelectedDownloadId}
            setCurrentPage={setCurrentPage}
            hasActiveDownload={hasActiveDownload}
            setHasActiveDownload={setHasActiveDownload}
            showMoreInfoDialog={showMoreInfoDialog}
          />
        )

        break
      case PAGES.downloadHistory:
        setSelectedDownloadId(null)
        setPageComponent(
          <DownloadHistory setCurrentPage={setCurrentPage} />
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
    setDownloadLocation(true, onSetDownloadLocation)

    return () => {
      windowsLinuxTitleBar(false, onWindowMaximized)
      autoUpdateAvailable(false, onAutoUpdateAvailable)
      autoUpdateProgress(false, onAutoUpdateProgress)
      setDownloadLocation(false, onSetDownloadLocation)
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
        {/* Hiding nav buttons until EDD-18 */}
        {/* <nav className={styles.nav}>
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
        </nav> */}
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

        {/* TODO Trevor toastList maxWidth 80% is covering up click/scroll events on DownloadItems under the toast */}
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
          setOpen={setMoreErrorInfoIsOpen}
          showTitle
          title="Errors occurred while downloading files"
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
      </main>
    </div>
  )
}

export default Layout
