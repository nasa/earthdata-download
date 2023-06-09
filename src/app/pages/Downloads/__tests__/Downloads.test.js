import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'

import { ElectronApiContext } from '../../../context/ElectronApiContext'
import Downloads from '../Downloads'

describe('Downloads component', () => {
  test('renders the downloads page', () => {
    // props
    const setCurrentPage = jest.fn()
    const setHasActiveDownload = jest.fn()
    const hasActiveDownload = false

    // context functions
    const beginDownload = jest.fn()
    const initializeDownload = jest.fn()
    const setDownloadLocation = jest.fn()
    const pauseDownloadItem = jest.fn()
    const reportProgress = jest.fn()
    const requestProgressReport = jest.fn()
    const resumeDownloadItem = jest.fn()
    const cancelDownloadItem = jest.fn()
    const openDownloadFolder = jest.fn()
    const copyDownloadPath = jest.fn()

    render(
      <ElectronApiContext.Provider value={
        {
          beginDownload,
          initializeDownload,
          setDownloadLocation,
          pauseDownloadItem,
          reportProgress,
          requestProgressReport,
          resumeDownloadItem,
          cancelDownloadItem,
          openDownloadFolder,
          copyDownloadPath
        }
      }
      >
        <Downloads
          setCurrentPage={setCurrentPage}
          hasActiveDownload={hasActiveDownload}
          setHasActiveDownload={setHasActiveDownload}
        />
      </ElectronApiContext.Provider>
    )

    expect(screen.getByText('No downloads in progress')).toBeInTheDocument()
  })
})
