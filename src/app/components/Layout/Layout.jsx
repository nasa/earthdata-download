import React, { useState } from 'react'
import classNames from 'classnames'
import { FaCog } from 'react-icons/fa'

import Button from '../Button/Button'
import DownloadHistory from '../DownloadHistory/DownloadHistory'
import Downloads from '../Downloads/Downloads'
import Dialog from '../Dialog/Dialog'
import Settings from '../Settings/Settings'

import { PAGES } from '../../constants/pages'

import * as styles from './Layout.module.scss'

const { electronAPI } = window

/**
 * Renders the page layout of the application. The title bar contents and the main 'page'
 */
const Layout = () => {
  const [currentPage, setCurrentPage] = useState(PAGES.downloads)

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

  return (
    <>
      <Dialog />
      <div className={styles.wrapper}>
        <header
          className={
            classNames(
              [
                styles.header,
                {
                  [styles.isWindows]: !electronAPI.isMac
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
            >
              Download History
            </Button>
          </nav>
          <section className={styles.actions}>
            <Button
              className={styles.settingsButton}
              Icon={FaCog}
              onClick={() => setCurrentPage(PAGES.settings)}
            >
              Settings
            </Button>
          </section>
        </header>
        <main className={styles.main}>
          {pageComponent}
        </main>
      </div>
    </>
  )
}

export default Layout
