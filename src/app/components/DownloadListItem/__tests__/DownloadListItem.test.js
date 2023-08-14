import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import userEvent from '@testing-library/user-event'

import DownloadListItem from '../DownloadListItem'
import DownloadItem from '../../DownloadItem/DownloadItem'

import downloadStates from '../../../constants/downloadStates'
import { ElectronApiContext } from '../../../context/ElectronApiContext'
import AppContext from '../../../context/AppContext'

jest.mock('../../DownloadItem/DownloadItem')

const download = {
  errors: null,
  loadingMoreFiles: false,
  progress: {
    percent: 50,
    finishedFiles: 5,
    totalFiles: 10,
    totalTime: 567
  },
  downloadId: 'mock-download-id',
  state: downloadStates.active
}

const setup = (overrideProps = {}) => {
  const addToast = jest.fn()
  const deleteAllToastsById = jest.fn()
  const cancelDownloadItem = jest.fn()
  const copyDownloadPath = jest.fn()
  const openDownloadFolder = jest.fn()
  const pauseDownloadItem = jest.fn()
  const restartDownload = jest.fn()
  const resumeDownloadItem = jest.fn()
  const retryErroredDownloadItem = jest.fn()
  const sendToEula = jest.fn()
  const sendToLogin = jest.fn()
  const setCurrentPage = jest.fn()
  const showMoreInfoDialog = jest.fn()
  const showWaitingForEulaDialog = jest.fn()
  const showWaitingForLoginDialog = jest.fn()
  const startReportingFiles = jest.fn()

  const props = {
    setCurrentPage,
    showMoreInfoDialog,
    download,
    ...overrideProps
  }

  render(
    <ElectronApiContext.Provider
      value={
        {
          cancelDownloadItem,
          copyDownloadPath,
          openDownloadFolder,
          pauseDownloadItem,
          restartDownload,
          resumeDownloadItem,
          retryErroredDownloadItem,
          sendToEula,
          sendToLogin,
          showWaitingForEulaDialog,
          showWaitingForLoginDialog,
          startReportingFiles
        }
      }
    >
      <AppContext.Provider
        value={
          {
            addToast,
            deleteAllToastsById
          }
        }
      >
        <DownloadListItem {...props} />
      </AppContext.Provider>
    </ElectronApiContext.Provider>
  )

  return {
    addToast,
    cancelDownloadItem,
    copyDownloadPath,
    openDownloadFolder,
    pauseDownloadItem,
    restartDownload,
    resumeDownloadItem,
    retryErroredDownloadItem,
    sendToEula,
    sendToLogin,
    showWaitingForEulaDialog,
    showWaitingForLoginDialog,
    startReportingFiles
  }
}

beforeEach(() => {
  DownloadItem.mockImplementation(jest.requireActual('../../DownloadItem/DownloadItem').default)
})

describe('DownloadListItem component', () => {
  test('renders a DownloadItem', () => {
    DownloadItem.mockImplementation(() => <div />)

    setup()

    expect(DownloadItem).toHaveBeenCalledTimes(1)
    expect(DownloadItem).toHaveBeenCalledWith(expect.objectContaining({
      actionsList: [
        expect.arrayContaining([
          expect.objectContaining({
            isActive: false,
            isPrimary: false,
            label: 'Log In with Earthdata Login'
          }, {
            isActive: false,
            isPrimary: false,
            label: 'View & Accept License Agreement'
          }, {
            isActive: true,
            isPrimary: true,
            label: 'Pause Download'
          }, {
            isActive: false,
            isPrimary: false,
            label: 'Resume Download'
          }, {
            isActive: true,
            isPrimary: true,
            label: 'Cancel Download'
          })
        ]),
        expect.arrayContaining([
          expect.objectContaining({
            isActive: true,
            isPrimary: false,
            label: 'Open Folder'
          }, {
            isActive: true,
            isPrimary: false,
            label: 'Copy Folder Path'
          })
        ]),
        expect.arrayContaining([
          expect.objectContaining({
            isActive: true,
            isPrimary: false,
            label: 'Restart Download'
          })
        ])
      ],
      downloadId: 'mock-download-id',
      itemName: 'mock-download-id',
      percent: 50,
      state: downloadStates.active
      // TODO how can I verify props here
      // status: expect.objectContaining({
      //   // primary: expect.anything(),
      //   primary: expect.any(<DownloadListItemPercent percent={42} />)
      //   // secondary: <DownloadListItemState percent={42} remainingTime={0} shouldShowTime={false} state="ACTIVE" />,
      //   // tertiary: <DownloadListItemFileProgress receivedBytes={61587289} shouldShowBytes totalBytes={61587289} />
      // })
    }), {})
  })

  describe('when errors exist', () => {
    test('calls addToast', () => {
      const { addToast } = setup({
        download: {
          ...download,
          errors: [{ mock: 'error' }]
        }
      })

      expect(addToast).toHaveBeenCalledTimes(1)
      expect(addToast).toHaveBeenCalledWith(expect.objectContaining({
        actions: expect.arrayContaining([
          expect.objectContaining({
            altText: 'Retry',
            buttonText: 'Retry'
          }, {
            altText: 'More Info',
            buttonText: 'More Info'
          })
        ]),
        id: 'mock-download-id',
        message: '1 file failed to download in mock-download-id',
        numberErrors: 1,
        title: 'An error occurred',
        variant: 'danger'
      }))
    })
  })

  describe('when clicking `Log In with Earthdata Login`', () => {
    test('calls sendToLogin', async () => {
      const { sendToLogin } = setup({
        download: {
          ...download,
          state: downloadStates.waitingForAuth
        }
      })

      const button = screen.getByText('Log In with Earthdata Login')
      await userEvent.click(button)

      expect(sendToLogin).toHaveBeenCalledTimes(1)
    })
  })

  describe('when clicking `View & Accept License Agreement`', () => {
    test('calls sendToEula', async () => {
      const { sendToEula } = setup({
        download: {
          ...download,
          state: downloadStates.waitingForEula
        }
      })

      const button = screen.getByText('View & Accept License Agreement')
      await userEvent.click(button)

      expect(sendToEula).toHaveBeenCalledTimes(1)
    })
  })

  describe('when clicking `Pause Download`', () => {
    test('calls pauseDownloadItem', async () => {
      const { pauseDownloadItem } = setup({
        download: {
          ...download,
          state: downloadStates.active
        }
      })

      const button = screen.getByText('Pause Download')
      await userEvent.click(button)

      expect(pauseDownloadItem).toHaveBeenCalledTimes(1)
    })
  })

  describe('when clicking `Resume Download`', () => {
    test('calls resumeDownloadItem', async () => {
      const { resumeDownloadItem } = setup({
        download: {
          ...download,
          state: downloadStates.paused
        }
      })

      const button = screen.getByText('Resume Download')
      await userEvent.click(button)

      expect(resumeDownloadItem).toHaveBeenCalledTimes(1)
    })
  })

  describe('when clicking `Cancel Download`', () => {
    test('calls cancelDownloadItem', async () => {
      const { cancelDownloadItem } = setup({
        download: {
          ...download,
          state: downloadStates.active
        }
      })

      const button = screen.getByText('Cancel Download')
      await userEvent.click(button)

      expect(cancelDownloadItem).toHaveBeenCalledTimes(1)
    })
  })

  describe('when clicking `Open Folder`', () => {
    test('calls openDownloadFolder', async () => {
      const { openDownloadFolder } = setup({
        download: {
          ...download,
          state: downloadStates.active
        }
      })

      const moreActions = screen.getByText('More Actions')
      await userEvent.click(moreActions)

      const button = screen.getByText('Open Folder')
      await userEvent.click(button)

      expect(openDownloadFolder).toHaveBeenCalledTimes(1)
    })
  })

  describe('when clicking `Copy Folder Path`', () => {
    test('calls copyDownloadPath', async () => {
      const { copyDownloadPath } = setup({
        download: {
          ...download,
          state: downloadStates.active
        }
      })

      const moreActions = screen.getByText('More Actions')
      await userEvent.click(moreActions)

      const button = screen.getByText('Copy Folder Path')
      await userEvent.click(button)

      expect(copyDownloadPath).toHaveBeenCalledTimes(1)
    })
  })

  describe('when clicking `Restart Download`', () => {
    test('calls restartDownload', async () => {
      const { restartDownload } = setup({
        download: {
          ...download,
          state: downloadStates.completed
        }
      })

      const moreActions = screen.getByText('More Actions')
      await userEvent.click(moreActions)

      const button = screen.getByText('Restart Download')
      await userEvent.click(button)

      expect(restartDownload).toHaveBeenCalledTimes(1)
    })
  })
})
