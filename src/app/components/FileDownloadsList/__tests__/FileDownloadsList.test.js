import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import userEvent from '@testing-library/user-event'
import MockDate from 'mockdate'

import { ElectronApiContext } from '../../../context/ElectronApiContext'
import FileDownloadsList from '../FileDownloadsList'

import downloadStates from '../../../constants/downloadStates'

beforeEach(() => {
  // Retrieved time from https://www.utctime.net/
  MockDate.set('2023-07-19T21:53:05Z')
})

const setup = (overrideProps) => {
  // Context functions
  const cancelDownloadItem = jest.fn()
  const copyDownloadPath = jest.fn()
  const openDownloadFolder = jest.fn()
  const reportFilesProgress = jest.fn()
  const restartDownload = jest.fn()

  const fileDownloadsProgressReport = [
    {
      id: 1294,
      downloadId: '7010 collection_1.5-20230718_162025',
      filename: 'file-mock-1.png',
      state: downloadStates.active,
      url: 'http://example.com/mock-filename-1.png',
      percent: 58,
      createdAt: 1689803243674,
      timeStart: 1689803244698,
      timeEnd: null,
      errors: null,
      receivedBytes: 17563648,
      remainingTime: 342,
      totalBytes: 29899960
    },
    {
      id: 57,
      downloadId: '7010 collection_1.5-20230718_162025',
      filename: 'file-mock-2.png',
      state: downloadStates.completed,
      url: 'http://example.com/mock-filename-2.png',
      percent: 100,
      createdAt: 1689803243674,
      timeStart: 1689803243899,
      timeEnd: 1689803248084,
      errors: null,
      receivedBytes: 22338948,
      totalBytes: 22338948
    },
    {
      id: 1295,
      downloadId: '7010 collection_1.5-20230718_162025',
      filename: 'file-mock-3.png',
      state: downloadStates.paused,
      url: 'http://example.com/mock-filename-3.png',
      percent: 58,
      createdAt: 1689803243674,
      timeStart: 1689803244698,
      timeEnd: null,
      errors: null,
      receivedBytes: 17563648,
      remainingTime: 342,
      totalBytes: 29899960
    }
  ]

  // Props
  const props = {
    fileDownloadsProgressReport,
    hideCompleted: false,
    ...overrideProps
  }

  render(
    <ElectronApiContext.Provider value={
      {
        cancelDownloadItem,
        copyDownloadPath,
        openDownloadFolder,
        restartDownload
      }
    }
    >
      <FileDownloadsList
        {...props}
      />
    </ElectronApiContext.Provider>
  )

  return {
    cancelDownloadItem,
    copyDownloadPath,
    openDownloadFolder,
    reportFilesProgress,
    restartDownload
  }
}

describe('FileDownloadsList component', () => {
  describe('when the file download is active', () => {
    test('the remaining time is correct', async () => {
      setup()
      expect(screen.getAllByTestId('file-downloads-list-time-remaining')[0]).toHaveTextContent('5 minutes, 42 seconds remaining')
    })

    test('the bytes remaining are correct', async () => {
      setup()
      expect(screen.getAllByTestId('file-downloads-list-bytes-remaining')[0]).toHaveTextContent('17 mb/29 mb downloaded')
    })

    test('clicking the `Cancel File` button calls `cancelItem`', async () => {
      const { cancelDownloadItem } = setup()
      const cancelButton = screen.getAllByText('Cancel File')[0]
      await userEvent.click(cancelButton)
      expect(cancelDownloadItem).toHaveBeenCalledTimes(1)
    })

    test('clicking the `Copy File Path` button calls `copyDownloadPath', async () => {
      const { copyDownloadPath } = setup()
      const copyFolderPathButton = screen.getAllByText('Copy File Path')[0]
      await userEvent.click(copyFolderPathButton)
      expect(copyDownloadPath).toHaveBeenCalledTimes(1)
    })

    test('`Open File` is not visible', async () => {
      const fileDownloadsProgressReport = [
        {
          id: 1294,
          downloadId: '7010 collection_1.5-20230718_162025',
          filename: 'file-mock-1.png',
          state: downloadStates.active,
          url: 'http://example.com/mock-filename-1.png',
          percent: 58,
          createdAt: 1689803243674,
          timeStart: 1689803244698,
          timeEnd: null,
          errors: null,
          receivedBytes: 17563648,
          remainingTime: 342,
          totalBytes: 29899960
        }]

      setup({ fileDownloadsProgressReport })
      // Need to open up the `More Actions`

      // This fileDownload is not in a completed state so the `openDownloadFolder` button will not be there
      const dropdownTrigger = screen.getByRole('button', { name: 'More Actions' })
      await userEvent.click(dropdownTrigger)

      expect(screen.queryByText('Open File')).not.toBeInTheDocument()
    })

    describe('when clicking the `More Actions` dropdown button', () => {
      test('clicking `Cancel File` calls `cancelItem`', async () => {
        const { cancelDownloadItem } = setup()
        // Need to open up the `More Actions`
        const dropdownTrigger = screen.getAllByRole('button', { name: 'More Actions' })[0]
        await userEvent.click(dropdownTrigger)

        const dropDownMenuCancelButton = screen.getAllByRole('menuitem')[0]

        await userEvent.click(dropDownMenuCancelButton)
        expect(cancelDownloadItem).toHaveBeenCalledTimes(1)
      })

      test('clicking `Copy File Path` calls `copyDownloadPath`', async () => {
        const { copyDownloadPath } = setup()
        // Need to open up the `More Actions` from the completed download
        const dropdownTrigger = screen.getAllByRole('button', { name: 'More Actions' })[1]
        await userEvent.click(dropdownTrigger)

        const dropDownMenuCopyPathButton = screen.getAllByRole('menuitem')[1]

        await userEvent.click(dropDownMenuCopyPathButton)
        expect(copyDownloadPath).toHaveBeenCalledTimes(1)
      })

      test('clicking `Restart File` calls `restartDownload`', async () => {
        const { restartDownload } = setup()

        // Restart download is not a primary button ensure it can't be clicked without opening the dropdown
        expect(screen.queryByText('Restart Download')).not.toBeInTheDocument()

        // Need to open up the `More Actions`
        const dropdownTrigger = screen.getAllByRole('button', { name: 'More Actions' })[0]
        await userEvent.click(dropdownTrigger)

        expect(screen.getAllByRole('menuitem')[0]).toBeInTheDocument()

        const restartDownloadButton = screen.getByText('Restart File')
        await userEvent.click(restartDownloadButton)
        expect(restartDownload).toHaveBeenCalledTimes(1)
      })

      test('`Open File` is not visible', async () => {
        const fileDownloadsProgressReport = [
          {
            id: 1294,
            downloadId: '7010 collection_1.5-20230718_162025',
            filename: 'file-mock-1.png',
            state: downloadStates.active,
            url: 'http://example.com/mock-filename-1.png',
            percent: 58,
            createdAt: 1689803243674,
            timeStart: 1689803244698,
            timeEnd: null,
            errors: null,
            receivedBytes: 17563648,
            remainingTime: 342,
            totalBytes: 29899960
          }]

        setup({ fileDownloadsProgressReport })
        // Need to open up the `More Actions`

        // This fileDownload is not in a completed state so the `openDownloadFolder` button will not be there
        const dropdownTrigger = screen.getByRole('button', { name: 'More Actions' })
        await userEvent.click(dropdownTrigger)

        expect(screen.queryByText('Open File')).not.toBeInTheDocument()
      })
    })
  })

  describe('when the download is complete', () => {
    test('clicking the `Open File` calls `openDownloadFolder`', async () => {
      const { openDownloadFolder } = setup()
      const openFolderButton = screen.getAllByText('Open File')[0]
      await userEvent.click(openFolderButton)
      expect(openDownloadFolder).toHaveBeenCalledTimes(1)
    })

    describe('when clicking the `More Actions` dropdown button', () => {
      test('clicking `Open File` calls `openDownloadFolder`', async () => {
        const { openDownloadFolder } = setup()

        // Note using `[1]` the button group for the second `fileDownload` since it is in completed state
        // The open file button will not show up otherwise
        const dropdownTrigger = screen.getAllByRole('button', { name: 'More Actions' })[1]
        await userEvent.click(dropdownTrigger)

        const dropDownOpenDownloadFolderButton = screen.getAllByRole('menuitem')[0]

        await userEvent.click(dropDownOpenDownloadFolderButton)
        expect(openDownloadFolder).toHaveBeenCalledTimes(1)
      })
    })
  })

  describe('when the `hide completed` checkbox is clicked', () => {
    test('completed file downloads do not render', async () => {
      setup({ hideCompleted: true })
      expect(screen.getByText('file-mock-1.png')).toBeInTheDocument()
      expect(screen.queryByText('file-mock-2.png')).not.toBeInTheDocument()
    })
  })
})
