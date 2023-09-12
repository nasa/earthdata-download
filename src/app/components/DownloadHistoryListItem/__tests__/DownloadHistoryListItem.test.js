import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import userEvent from '@testing-library/user-event'

import DownloadHistoryListItem from '../DownloadHistoryListItem'
import DownloadItem from '../../DownloadItem/DownloadItem'

import downloadStates from '../../../constants/downloadStates'
import { ElectronApiContext } from '../../../context/ElectronApiContext'
import AppContext from '../../../context/AppContext'

jest.mock('../../DownloadItem/DownloadItem')

const download = {
  errors: null,
  loadingMoreFiles: false,
  progress: {
    percent: 100,
    finishedFiles: 10,
    totalFiles: 10,
    totalTime: 567000
  },
  downloadId: 'mock-download-id',
  state: downloadStates.completed,
  timeStart: 123000
}

const setup = (overrideProps = {}) => {
  const deleteAllToastsById = jest.fn()
  const clearDownloadHistory = jest.fn()
  const copyDownloadPath = jest.fn()
  const openDownloadFolder = jest.fn()
  const restartDownload = jest.fn()
  const showMoreInfoDialog = jest.fn()
  const showWaitingForEulaDialog = jest.fn()
  const showWaitingForLoginDialog = jest.fn()

  const props = {
    showMoreInfoDialog,
    download,
    ...overrideProps
  }

  render(
    <ElectronApiContext.Provider
      value={
        {
          clearDownloadHistory,
          copyDownloadPath,
          openDownloadFolder,
          restartDownload,
          showWaitingForEulaDialog,
          showWaitingForLoginDialog
        }
      }
    >
      <AppContext.Provider
        value={
          {
            deleteAllToastsById
          }
        }
      >
        <DownloadHistoryListItem {...props} />
      </AppContext.Provider>
    </ElectronApiContext.Provider>
  )

  return {
    deleteAllToastsById,
    clearDownloadHistory,
    copyDownloadPath,
    openDownloadFolder,
    restartDownload
  }
}

beforeEach(() => {
  DownloadItem.mockImplementation(jest.requireActual('../../DownloadItem/DownloadItem').default)
})

describe('DownloadHistoryListItem component', () => {
  test('renders a DownloadItem', () => {
    DownloadItem.mockImplementation(() => <div />)

    setup()

    expect(DownloadItem).toHaveBeenCalledTimes(1)
    expect(DownloadItem).toHaveBeenCalledWith(expect.objectContaining({
      actionsList: [
        expect.arrayContaining([
          expect.objectContaining({
            isActive: true,
            isPrimary: true,
            label: 'Open Folder'
          }, {
            isActive: true,
            isPrimary: true,
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
      percent: 100,
      shouldBeClickable: false,
      state: downloadStates.completed
      // TODO how can I verify props here
      // status: expect.objectContaining({
      //   // primary: expect.anything(),
      //   primary: expect.any(<DownloadHistoryListItemPercent percent={42} />)
      //   // secondary: <DownloadHistoryListItemState percent={42} remainingTime={0} shouldShowTime={false} state="ACTIVE" />,
      //   // tertiary: <DownloadHistoryListItemFileProgress receivedBytes={61587289} shouldShowBytes totalBytes={61587289} />
      // })
    }), {})
  })

  describe('when clicking `Open Folder`', () => {
    test('calls openDownloadFolder', async () => {
      const { openDownloadFolder } = setup()

      const button = screen.getByText('Open Folder')
      await userEvent.click(button)

      expect(openDownloadFolder).toHaveBeenCalledTimes(1)
    })
  })

  describe('when clicking `Copy Folder Path`', () => {
    test('calls copyDownloadPath', async () => {
      const { copyDownloadPath } = setup()

      const button = screen.getByText('Copy Folder Path')
      await userEvent.click(button)

      expect(copyDownloadPath).toHaveBeenCalledTimes(1)
    })
  })

  describe('when clicking `Restart Download`', () => {
    test('calls restartDownload', async () => {
      const { restartDownload, deleteAllToastsById } = setup()

      const moreActions = screen.getByText('More Actions')
      await userEvent.click(moreActions)

      const button = screen.getByText('Restart Download')
      await userEvent.click(button)

      expect(restartDownload).toHaveBeenCalledTimes(1)

      expect(deleteAllToastsById).toHaveBeenCalledTimes(1)
      expect(deleteAllToastsById).toHaveBeenCalledWith('mock-download-id')
    })
  })

  describe('when clicking `Clear Download`', () => {
    test('calls clearDownloadHistory', async () => {
      const { clearDownloadHistory, deleteAllToastsById } = setup()

      const moreActions = screen.getByText('More Actions')
      await userEvent.click(moreActions)

      const button = screen.getByText('Clear Download')
      await userEvent.click(button)

      expect(clearDownloadHistory).toHaveBeenCalledTimes(1)
      expect(clearDownloadHistory).toHaveBeenCalledWith({ downloadId: 'mock-download-id' })

      expect(deleteAllToastsById).toHaveBeenCalledTimes(1)
      expect(deleteAllToastsById).toHaveBeenCalledWith('mock-download-id')
    })
  })
})
