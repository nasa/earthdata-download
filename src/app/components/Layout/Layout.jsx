import React, { useContext, useEffect, useState } from 'react'
import classNames from 'classnames'
import { FaCog } from 'react-icons/fa'
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
import Settings from '../../dialogs/Settings/Settings'
import ToastList from '../ToastList/ToastList'

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
    closeWindow,
    minimizeWindow,
    maximizeWindow,
    isMac,
    isWin,
    isLinux,
    windowsLinuxTitleBar
  } = useContext(ElectronApiContext)

  const appContext = useAppContext()
  const {
    toasts,
    addToast,
    dismissToast
  } = appContext
  const { activeToasts = {} } = toasts

  const [currentPage, setCurrentPage] = useState(PAGES.downloads)
  const [isWindowMaximized, setIsWindowMaximized] = useState(false)

  const onWindowMaximized = (event, windowMaximized) => {
    setIsWindowMaximized(windowMaximized)
  }
  const [settingsDialogIsOpen, setSettingsDialogIsOpen] = useState(false)
  const [hasActiveDownload, setHasActiveDownload] = useState(false)

  const onDismissToast = (id) => {
    if (id === updateAvailableToastId) {
      autoUpdateInstallLater()
    }

    dismissToast(id)
  }

  const onAutoUpdateAvailable = () => {
    addToast({
      id: updateAvailableToastId,
      title: 'An app update is available',
      message: 'Downloading update: 0%',
      numberErrors: 0,
      variant: 'spinner'
    })
  }

  const onAutoUpdateProgress = (event, info) => {
    console.log('🚀 ~ file: Layout.jsx:70 ~ onAutoUpdateProgress ~ info:', info)
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

  let pageComponent

  switch (currentPage) {
    case PAGES.downloads:
      pageComponent = (
        <Downloads
          setCurrentPage={setCurrentPage}
          hasActiveDownload={hasActiveDownload}
          setHasActiveDownload={setHasActiveDownload}
        />
      )
      break
    case PAGES.downloadHistory:
      pageComponent = (
        <DownloadHistory setCurrentPage={setCurrentPage} />
      )
      break
    default:
      break
  }

  useEffect(() => {
    windowsLinuxTitleBar(true, onWindowMaximized)
    autoUpdateAvailable(true, onAutoUpdateAvailable)
    autoUpdateProgress(true, onAutoUpdateProgress)

    return () => {
      windowsLinuxTitleBar(false, onWindowMaximized)
      autoUpdateAvailable(false, onAutoUpdateAvailable)
      autoUpdateProgress(false, onAutoUpdateProgress)
    }
  }, [])

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
        {(isWin || isLinux) && (
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
        )}
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
            settingsDialogIsOpen={settingsDialogIsOpen}
          />
        </Dialog>
      </main>
    </div>
  )
}

export default Layout
