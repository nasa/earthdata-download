import React, { useContext, useEffect, useState } from 'react'
import classNames from 'classnames'
import { FaCog } from 'react-icons/fa'
import {
  VscChromeRestore, VscChromeMaximize, VscChromeMinimize, VscChromeClose
} from 'react-icons/vsc'
import Button from '../Button/Button'
import DownloadHistory from '../../pages/DownloadHistory/DownloadHistory'
import Downloads from '../../pages/Downloads/Downloads'
import Settings from '../../pages/Settings/Settings'

import { PAGES } from '../../constants/pages'

import { ElectronApiContext } from '../../context/ElectronApiContext'

import * as styles from './Layout.module.scss'
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
    closeWindow,
    minimizeWindow,
    maximizeWindow,
    isMac,
    isWin,
    isLinux,
    windowsLinuxTitleBar
  } = useContext(ElectronApiContext)
  const [currentPage, setCurrentPage] = useState(PAGES.downloads)
  const [isWindowMaximized, setIsWindowMaximized] = useState(false)

  const onWindowMaximized = (event, windowMaximized) => {
    setIsWindowMaximized(windowMaximized)
  }

  let pageComponent

  switch (currentPage) {
    case PAGES.downloads:
      pageComponent = (
        <Downloads setCurrentPage={setCurrentPage} />
      )
      break
    case PAGES.downloadHistory:
      pageComponent = (
        <DownloadHistory setCurrentPage={setCurrentPage} />
      )
      break
    case PAGES.settings:
      pageComponent = (
        <Settings />
      )
      break
    default:
      break
  }

  useEffect(() => {
    windowsLinuxTitleBar(true, onWindowMaximized)

    return () => {
      windowsLinuxTitleBar(false, onWindowMaximized)
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
            onClick={() => setCurrentPage(PAGES.settings)}
            dataTestId="layout-button-settings"
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
            >
              Close
            </Button>
          </div>
        )}
      </header>
      <main className={styles.main}>
        {pageComponent}
      </main>
    </div>
  )
}

export default Layout
