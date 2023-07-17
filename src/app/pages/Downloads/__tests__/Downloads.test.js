import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'

import { ElectronApiContext } from '../../../context/ElectronApiContext'
import Downloads from '../Downloads'
import AppContext from '../../../context/AppContext'
import ListPage from '../../../components/ListPage/ListPage'

jest.mock('../../../components/ListPage/ListPage', () => jest.fn(
  () => <mock-ListPage>Mock ListPage</mock-ListPage>
))

describe('Downloads component', () => {
  test('renders the downloads page', () => {
    // Props
    const setCurrentPage = jest.fn()
    const hasActiveDownload = false
    const setHasActiveDownload = jest.fn()
    const showMoreInfoDialog = jest.fn()

    // Context functions
    const cancelDownloadItem = jest.fn()
    const copyDownloadPath = jest.fn()
    const openDownloadFolder = jest.fn()
    const pauseDownloadItem = jest.fn()
    const reportDownloadsProgress = jest.fn()
    const restartDownload = jest.fn()
    const resumeDownloadItem = jest.fn()
    const sendToEula = jest.fn()
    const sendToLogin = jest.fn()

    render(
      <ElectronApiContext.Provider value={
        {
          cancelDownloadItem,
          copyDownloadPath,
          openDownloadFolder,
          pauseDownloadItem,
          reportDownloadsProgress,
          restartDownload,
          resumeDownloadItem,
          sendToEula,
          sendToLogin
        }
      }
      >
        <AppContext.Provider value={
          {
            toasts: {
              addToast: () => {}
            }
          }
        }
        >
          <Downloads
            hasActiveDownload={hasActiveDownload}
            setCurrentPage={setCurrentPage}
            showMoreInfoDialog={showMoreInfoDialog}
            setHasActiveDownload={setHasActiveDownload}
          />
        </AppContext.Provider>
      </ElectronApiContext.Provider>
    )

    // The useEffect for setDownloadItems(items) is updating a state variable,
    // setDownloadItems(items) is updating a state variable,
    // causing the component to re-render, which renders the mock a second time.
    expect(ListPage).toHaveBeenCalledTimes(2)
    expect(screen.queryAllByText('Mock ListPage').length).toBe(1)
  })
})
