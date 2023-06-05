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
      test('opens the dropdown component', async () => {
        const moreActions = [
          [
            {
              label: 'Copy Folder Path',
              onSelect: jest.fn(),
              visible: true,
              disabled: false
            }
          ]
        ]

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
            moreActions={moreActions}
          />
        )
        const dropdownTrigger = screen.getByTestId('dropdown-trigger')

        await userEvent.click(dropdownTrigger)
        expect(screen.queryByText('Copy Folder Path')).toBeInTheDocument()
      })

      describe('when selecting a dropdown option', () => {
        test('fires the function callback', async () => {
          const moreActions = [
            [
              {
                label: 'Copy Folder Path',
                onSelect: jest.fn(),
                visible: true,
                disabled: false
              }
            ]
          ]

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
              moreActions={moreActions}
            />
          )
          const dropdownTrigger = screen.getByTestId('dropdown-trigger')

          await userEvent.click(dropdownTrigger)
          const copyPathButton = screen.queryByText('Copy Folder Path')
          await userEvent.click(copyPathButton)

          expect(moreActions[0][0].onSelect).toHaveBeenCalledTimes(1)
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
