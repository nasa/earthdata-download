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
          />
        )

        const cancelButton = screen.getByText('Cancel Download')

        await userEvent.click(cancelButton)

        expect(onCancelDownloadMock).toHaveBeenCalledTimes(1)
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
        />
      )

      expect(screen.getByText('Completed')).toBeInTheDocument()
    })
  })
})
