import React, { useState } from 'react'
import classNames from 'classnames'

import DownloadHistory from '../DownloadHistory/DownloadHistory'
import Downloads from '../Downloads/Downloads'
import Settings from '../Settings/Settings'

import { PAGES } from '../../constants/pages'

import './Layout.css'

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

  const settingsClassNames = classNames([
    'settings',
    {
      'mac-settings': electronAPI.isMac
    },
    {
      'windows-settings': !electronAPI.isMac
    }
  ])

  const downloadsButtonClassNames = classNames([
    'nav-button',
    {
      'is-active': currentPage === PAGES.downloads
    }
  ])
  const downloadHistoryButtonClassNames = classNames([
    'nav-button',
    {
      'is-active': currentPage === PAGES.downloadHistory
    }
  ])
  const settingsButtonClassNames = classNames([
    'settings-button',
    {
      'is-active': currentPage === PAGES.settings
    }
  ])

  return (
    <div>
      <div className="titlebar">
        <div className="navigation">
          <button
            className={downloadsButtonClassNames}
            onClick={() => setCurrentPage(PAGES.downloads)}
            type="button"
          >
            Downloads
          </button>
          <button
            className={downloadHistoryButtonClassNames}
            onClick={() => setCurrentPage(PAGES.downloadHistory)}
            type="button"
          >
            Download History
          </button>
        </div>
        <div className={settingsClassNames}>
          <button
            className={settingsButtonClassNames}
            onClick={() => setCurrentPage(PAGES.settings)}
            type="button"
          >
            Settings
          </button>
        </div>
      </div>
      <div className="wrapper">
        {pageComponent}
      </div>
    </div>
  )
}

export default Layout
