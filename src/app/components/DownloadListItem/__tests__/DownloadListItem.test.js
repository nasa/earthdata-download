import React from 'react'
import { render } from '@testing-library/react'
import '@testing-library/jest-dom'

import DownloadListItem from '../DownloadListItem'
import DownloadItem from '../../DownloadItem/DownloadItem'

import downloadStates from '../../../constants/downloadStates'
import { ElectronApiContext } from '../../../context/ElectronApiContext'
import AppContext from '../../../context/AppContext'

jest.mock('../../DownloadItem/DownloadItem', () => jest.fn(() => (
  <mock-DownloadItem data-testid="DownloadItem" />
)))

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
  const onCancelDownloadItem = jest.fn()
  const onCopyDownloadPath = jest.fn()
  const onOpenDownloadFolder = jest.fn()
  const onPauseDownloadItem = jest.fn()
  const onRestartDownload = jest.fn()
  const onResumeDownloadItem = jest.fn()
  const retryErroredDownloadItem = jest.fn()
  const sendToEula = jest.fn()
  const sendToLogin = jest.fn()
  const setCurrentPage = jest.fn()
  const showMoreInfoDialog = jest.fn()

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
          onCancelDownloadItem,
          onCopyDownloadPath,
          onOpenDownloadFolder,
          onPauseDownloadItem,
          onRestartDownload,
          onResumeDownloadItem,
          retryErroredDownloadItem,
          sendToEula,
          sendToLogin
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
    addToast
  }
}

describe('DownloadListItem component', () => {
  test('renders a DownloadItem', () => {
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
})
