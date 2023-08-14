import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import userEvent from '@testing-library/user-event'

import FileListItem from '../FileListItem'
import DownloadItem from '../../DownloadItem/DownloadItem'

import downloadStates from '../../../constants/downloadStates'
import { ElectronApiContext } from '../../../context/ElectronApiContext'

jest.mock('../../DownloadItem/DownloadItem')

const file = {
  id: 123,
  downloadId: 'mock-download-id',
  filename: 'mock-file.png',
  state: downloadStates.active,
  percent: 42,
  createdAt: 691690191124,
  timeStart: 1691690280763,
  timeEnd: null,
  receivedBytes: 61587289,
  totalBytes: 61587289,
  remainingTime: 0
}

const setup = (overrideProps = {}) => {
  const cancelDownloadItem = jest.fn()
  const copyDownloadPath = jest.fn()
  const openDownloadFolder = jest.fn()
  const restartDownload = jest.fn()
  const showWaitingForEulaDialog = jest.fn()
  const showWaitingForLoginDialog = jest.fn()
  const startReportingFiles = jest.fn()

  const props = {
    file,
    ...overrideProps
  }

  render(
    <ElectronApiContext.Provider
      value={
        {
          cancelDownloadItem,
          copyDownloadPath,
          openDownloadFolder,
          restartDownload,
          showWaitingForEulaDialog,
          showWaitingForLoginDialog,
          startReportingFiles
        }
      }
    >
      <FileListItem {...props} />
    </ElectronApiContext.Provider>
  )

  return {
    cancelDownloadItem,
    copyDownloadPath,
    openDownloadFolder,
    restartDownload
  }
}

beforeEach(() => {
  DownloadItem.mockImplementation(jest.requireActual('../../DownloadItem/DownloadItem').default)
})

describe('FileListItem component', () => {
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
            label: 'Cancel File',
            variant: 'danger'
          })
        ]),
        expect.arrayContaining([
          expect.objectContaining({
            isActive: false,
            isPrimary: false,
            label: 'Open File'
          }, {
            isActive: false,
            isPrimary: false,
            label: 'Copy File Path'
          }, {
            isActive: false,
            isPrimary: false,
            label: 'Restart File'
          })
        ])
      ],
      downloadId: 'mock-download-id',
      filename: 'mock-file.png',
      itemName: 'mock-file.png',
      percent: 42,
      state: downloadStates.active
      // TODO how can I verify props here
      // status: expect.objectContaining({
      //   // primary: expect.anything(),
      //   primary: expect.any(<FileListItemPercent percent={42} />)
      //   // secondary: <FileListItemTimeRemaining percent={42} remainingTime={0} shouldShowTime={false} state="ACTIVE" />,
      //   // tertiary: <FileListItemSizeProgress receivedBytes={61587289} shouldShowBytes totalBytes={61587289} />
      // })
    }), {})
  })

  describe('when clicking `Cancel File`', () => {
    test('calls cancelDownloadItem', async () => {
      const { cancelDownloadItem } = setup({
        file: {
          ...file,
          state: downloadStates.active
        }
      })

      const button = screen.getByText('Cancel File')
      await userEvent.click(button)

      expect(cancelDownloadItem).toHaveBeenCalledTimes(1)
    })
  })

  describe('when clicking `Open File`', () => {
    test('calls openDownloadFolder', async () => {
      const { openDownloadFolder } = setup({
        file: {
          ...file,
          state: downloadStates.completed
        }
      })

      const button = screen.getByText('Open File')
      await userEvent.click(button)

      expect(openDownloadFolder).toHaveBeenCalledTimes(1)
    })
  })

  describe('when clicking `Copy File Path`', () => {
    test('calls copyDownloadPath', async () => {
      const { copyDownloadPath } = setup({
        file: {
          ...file,
          state: downloadStates.completed
        }
      })

      const button = screen.getByText('Copy File Path')
      await userEvent.click(button)

      expect(copyDownloadPath).toHaveBeenCalledTimes(1)
    })
  })

  describe('when clicking `Restart File`', () => {
    test('calls restartDownload', async () => {
      const { restartDownload } = setup({
        file: {
          ...file,
          state: downloadStates.completed
        }
      })

      const moreActions = screen.getByText('More Actions')
      await userEvent.click(moreActions)

      const button = screen.getByText('Restart File')
      await userEvent.click(button)

      expect(restartDownload).toHaveBeenCalledTimes(1)
    })
  })
})
