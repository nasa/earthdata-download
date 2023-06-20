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
      {
        isMac && (
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
            <section className={styles.actions}>
              <Button
                className={styles.settingsButton}
                Icon={FaCog}
                onClick={() => setCurrentPage(PAGES.settings)}
                dataTestId="layout-button-settings"
              >
                Settings
              </Button>
            </section>
          </header>
        )
      }
      {
        (isWin || isLinux) && (
          <header
            data-testid="windows-layout-header"
            className={
              classNames(
                [
                  styles.header,
                  {
                    [styles.isWin]: isWin
                  }
                ]
              )
            }
          >
            <div className={styles.windowsWrapper}>
              <Button
                className={styles.settingsButton}
                Icon={FaCog}
                onClick={() => setCurrentPage(PAGES.settings)}
                dataTestId="layout-button-settings"
              >
                Settings
              </Button>
            </div>
            <div className={styles.windowsButtons}>
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
                onClick={() => minimizeWindow()}
                Icon={VscChromeMinimize}
                hideLabel
              >
                minimize
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
                onClick={() => { maximizeWindow() }}
                Icon={isWindowMaximized && isWin ? VscChromeRestore : VscChromeMaximize}
                hideLabel
              >
                maximize/restore
              </Button>
              <Button
                className={
                  classNames(
                    [
                      styles.minMaxCloseButton,
                      styles.windowsClose,
                      {
                        [styles.isLinux]: isLinux
                      }
                    ]
                  )
                }
                onClick={() => closeWindow()}
                Icon={VscChromeClose}
                hideLabel
              >
                close
              </Button>
            </div>
          </header>
        )
      }
      <main className={styles.main}>
        {pageComponent}
      </main>
    </div>
  )
}

export default Layout
