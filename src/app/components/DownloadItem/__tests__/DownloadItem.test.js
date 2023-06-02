import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import userEvent from '@testing-library/user-event'

import DownloadItem from '../DownloadItem'

const progressObj = {
  percent: 0,
  finishedFiles: 0,
  totalFiles: 1,
  totalTime: 0
}

describe('DownloadItem component', () => {
  test('displays the download title', () => {
    render(
      <DownloadItem
        downloadId="download-id"
        downloadName="download-name"
        progress={progressObj}
        state="ACTIVE"
        onCancelDownload={() => {}}
        onPauseDownload={() => {}}
        onResumeDownload={() => {}}
        onOpenDownloadFolder={() => {}}
        onCopyDownloadPath={() => {}}
      />
    )

    expect(screen.getByText('download-name')).toBeInTheDocument()
  })

  test('displays the download percentage', () => {
    render(
      <DownloadItem
        downloadId="download-id"
        downloadName="download-name"
        progress={progressObj}
        state="ACTIVE"
        onCancelDownload={() => {}}
        onPauseDownload={() => {}}
        onResumeDownload={() => {}}
        onOpenDownloadFolder={() => {}}
        onCopyDownloadPath={() => {}}
      />
    )

    expect(screen.getByText('0%')).toBeInTheDocument()
  })

  test('displays a humanized status', () => {
    render(
      <DownloadItem
        downloadId="download-id"
        downloadName="download-name"
        progress={progressObj}
        state="ACTIVE"
        onCancelDownload={() => {}}
        onPauseDownload={() => {}}
        onResumeDownload={() => {}}
        onOpenDownloadFolder={() => {}}
        onCopyDownloadPath={() => {}}
      />
    )

    expect(screen.getByText('0 of 1 files done in 0 seconds')).toBeInTheDocument()
  })

  describe('when a download is active', () => {
    test('displays the correct download status', () => {
      render(
        <DownloadItem
          downloadId="download-id"
          downloadName="download-name"
          progress={progressObj}
          state="ACTIVE"
          onCancelDownload={() => {}}
          onPauseDownload={() => {}}
          onResumeDownload={() => {}}
          onOpenDownloadFolder={() => {}}
          onCopyDownloadPath={() => {}}
        />
      )

      expect(screen.getByText('Downloading')).toBeInTheDocument()
    })

    describe('when clicking the pause button', () => {
      test('fires the onPauseDownload callback', async () => {
        const onPauseDownloadMock = jest.fn()

        render(
          <DownloadItem
            downloadId="download-id"
            downloadName="download-name"
            progress={progressObj}
            state="ACTIVE"
            onCancelDownload={() => {}}
            onPauseDownload={onPauseDownloadMock}
            onResumeDownload={() => {}}
            onOpenDownloadFolder={() => {}}
            onCopyDownloadPath={() => {}}
          />
        )

        const pauseButton = screen.getByText('Pause Download')

        await userEvent.click(pauseButton)

        expect(onPauseDownloadMock).toHaveBeenCalledTimes(1)
      })
    })

    describe('when clicking the cancel button', () => {
      test('fires the onCancelDownload callback', async () => {
        const onCancelDownloadMock = jest.fn()

        render(
          <DownloadItem
            downloadId="download-id"
            downloadName="download-name"
            progress={progressObj}
            state="ACTIVE"
            onCancelDownload={onCancelDownloadMock}
            onPauseDownload={() => {}}
            onResumeDownload={() => {}}
            onOpenDownloadFolder={() => {}}
            onCopyDownloadPath={() => {}}
          />
        )

        const cancelButton = screen.getByText('Cancel Download')

        await userEvent.click(cancelButton)

        expect(onCancelDownloadMock).toHaveBeenCalledTimes(1)
      })
    })

    describe('when clicking the dropdown button', () => {
      test('opens the DownloadDropdown component', async () => {
        render(
          <DownloadItem
            downloadId="download-id"
            downloadName="download-name"
            progress={progressObj}
            state="ACTIVE"
            onCancelDownload={() => {}}
            onPauseDownload={() => {}}
            onResumeDownload={() => {}}
            onOpenDownloadFolder={() => {}}
            onCopyDownloadPath={() => {}}
          />
        )
        const dropdownTrigger = screen.getByTestId('dropdown-trigger')

        await userEvent.click(dropdownTrigger)
        expect(screen.queryByTestId('dropdown-pause')).toBeInTheDocument()
      })

      describe('fires the option function callbacks', () => {
        test('fires the pause function callback', async () => {
          const onPauseDownloadMock = jest.fn()

          render(
            <DownloadItem
              downloadId="download-id"
              downloadName="download-name"
              progress={progressObj}
              state="ACTIVE"
              onCancelDownload={() => {}}
              onPauseDownload={onPauseDownloadMock}
              onResumeDownload={() => {}}
              onOpenDownloadFolder={() => {}}
              onCopyDownloadPath={() => {}}
            />
          )
          const dropdownTrigger = screen.getByTestId('dropdown-trigger')

          await userEvent.click(dropdownTrigger)
          const pauseButton = screen.queryByTestId('dropdown-pause')
          await userEvent.click(pauseButton)

          expect(onPauseDownloadMock).toHaveBeenCalledTimes(1)
        })

        test('fires the resume function callback', async () => {
          const onResumeDownloadMock = jest.fn()

          render(
            <DownloadItem
              downloadId="download-id"
              downloadName="download-name"
              progress={progressObj}
              state="PAUSED"
              onCancelDownload={() => {}}
              onPauseDownload={() => {}}
              onResumeDownload={onResumeDownloadMock}
              onOpenDownloadFolder={() => {}}
              onCopyDownloadPath={() => {}}
            />
          )
          const dropdownTrigger = screen.getByTestId('dropdown-trigger')

          await userEvent.click(dropdownTrigger)
          const resumeButton = screen.queryByTestId('dropdown-resume')
          await userEvent.click(resumeButton)

          expect(onResumeDownloadMock).toHaveBeenCalledTimes(1)
        })

        test('fires the cancel function callback', async () => {
          const onCancelDownloadMock = jest.fn()

          render(
            <DownloadItem
              downloadId="download-id"
              downloadName="download-name"
              progress={progressObj}
              state="ACTIVE"
              onCancelDownload={onCancelDownloadMock}
              onPauseDownload={() => {}}
              onResumeDownload={() => {}}
              onOpenDownloadFolder={() => {}}
              onCopyDownloadPath={() => {}}
            />
          )
          const dropdownTrigger = screen.getByTestId('dropdown-trigger')

          await userEvent.click(dropdownTrigger)
          const cancelButton = screen.queryByTestId('dropdown-cancel')
          await userEvent.click(cancelButton)

          expect(onCancelDownloadMock).toHaveBeenCalledTimes(1)
        })

        test('fires the open folder function callback', async () => {
          const onOpenFolderMock = jest.fn()
          const newProgressObj = {
            ...progressObj,
            finishedFiles: 1
          }

          render(
            <DownloadItem
              downloadId="download-id"
              downloadName="download-name"
              progress={newProgressObj}
              state="ACTIVE"
              onCancelDownload={() => {}}
              onPauseDownload={() => {}}
              onResumeDownload={() => {}}
              onOpenDownloadFolder={onOpenFolderMock}
              onCopyDownloadPath={() => {}}
            />
          )
          const dropdownTrigger = screen.getByTestId('dropdown-trigger')

          await userEvent.click(dropdownTrigger)
          const openFolderButton = screen.getByTestId('dropdown-open-folder')
          await userEvent.click(openFolderButton)

          expect(onOpenFolderMock).toHaveBeenCalledTimes(1)
        })
      })
    })
  })

  describe('when a download is paused', () => {
    test('displays the correct download status', () => {
      render(
        <DownloadItem
          downloadId="download-id"
          downloadName="download-name"
          progress={progressObj}
          state="PAUSED"
          onCancelDownload={() => {}}
          onPauseDownload={() => {}}
          onResumeDownload={() => {}}
          onOpenDownloadFolder={() => {}}
          onCopyDownloadPath={() => {}}
        />
      )

      expect(screen.getByText('Paused')).toBeInTheDocument()
    })

    describe('when clicking the resume button', () => {
      test('fires the onResumeDownload callback', async () => {
        const onResumeDownloadMock = jest.fn()

        render(
          <DownloadItem
            downloadId="download-id"
            downloadName="download-name"
            progress={progressObj}
            state="PAUSED"
            onCancelDownload={() => {}}
            onPauseDownload={() => {}}
            onResumeDownload={onResumeDownloadMock}
            onOpenDownloadFolder={() => {}}
            onCopyDownloadPath={() => {}}
          />
        )

        const resumeButton = screen.getByText('Resume Download')

        await userEvent.click(resumeButton)

        expect(onResumeDownloadMock).toHaveBeenCalledTimes(1)
      })
    })
  })

  describe('when a download is completed', () => {
    test('displays the correct download status', () => {
      render(
        <DownloadItem
          downloadId="download-id"
          downloadName="download-name"
          progress={progressObj}
          state="COMPLETED"
          onCancelDownload={() => {}}
          onPauseDownload={() => {}}
          onResumeDownload={() => {}}
          onOpenDownloadFolder={() => {}}
          onCopyDownloadPath={() => {}}
        />
      )

      expect(screen.getByText('Completed')).toBeInTheDocument()
    })

    describe('when clicking the open download folder button', () => {
      test('fires the onOpenDownloadFolder callback', async () => {
        const onOpenFolderMock = jest.fn()

        render(
          <DownloadItem
            downloadId="download-id"
            downloadName="download-name"
            progress={progressObj}
            state="COMPLETED"
            onCancelDownload={() => {}}
            onPauseDownload={() => {}}
            onResumeDownload={() => {}}
            onOpenDownloadFolder={onOpenFolderMock}
            onCopyDownloadPath={() => {}}
          />
        )
        // Copy Folder Path
        const openFolderButton = screen.getByText('Open Folder')

        await userEvent.click(openFolderButton)

        expect(onOpenFolderMock).toHaveBeenCalledTimes(1)
      })
    })

    describe('when clicking the copy folder path button', () => {
      test('fires the onCopyDownloadPath callback', async () => {
        const onCopyDownloadPathMock = jest.fn()

        render(
          <DownloadItem
            downloadId="download-id"
            downloadName="download-name"
            progress={progressObj}
            state="COMPLETED"
            onCancelDownload={() => {}}
            onPauseDownload={() => {}}
            onResumeDownload={() => {}}
            onOpenDownloadFolder={() => {}}
            onCopyDownloadPath={onCopyDownloadPathMock}
          />
        )
        const onCopyDownloadPathButton = screen.getByText('Copy Folder Path')

        await userEvent.click(onCopyDownloadPathButton)

        expect(onCopyDownloadPathMock).toHaveBeenCalledTimes(1)
      })
    })
  })
})
