import React, { useContext, useState } from 'react'
import classNames from 'classnames'
import { FaCog } from 'react-icons/fa'

import Button from '../Button/Button'
import DownloadHistory from '../../pages/DownloadHistory/DownloadHistory'
import Downloads from '../../pages/Downloads/Downloads'
import Settings from '../../pages/Settings/Settings'
import Tooltip from '../Tooltip/Tooltip'

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
  const { isMac } = useContext(ElectronApiContext)

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

      <main className={styles.main}>
        {pageComponent}
      </main>
    </div>
  )
}

export default Layout
