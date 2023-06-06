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
        />
      )

      expect(screen.getByText('Downloading')).toBeInTheDocument()
    })

    describe('when clicking a primary action button', () => {
      test('fires the action callback', async () => {
        const primaryActionsList = [
          {
            label: 'test-label',
            isActive: true,
            isPrimary: true,
            callback: jest.fn(),
            icon: null
          }
        ]

        render(
          <DownloadItem
            downloadId="download-id"
            downloadName="download-name"
            progress={progressObj}
            state="ACTIVE"
            primaryActionsList={primaryActionsList}
          />
        )

        const testButton = screen.getByText('test-label')

        await userEvent.click(testButton)

        expect(primaryActionsList[0].callback).toHaveBeenCalledTimes(1)
      })
    })

    describe('when generating primary actions', () => {
      test('if action is not primary it is not visible', async () => {
        const primaryActionsList = [
          {
            label: 'test-label-1',
            isActive: true,
            isPrimary: true,
            callback: jest.fn(),
            icon: null
          },
          {
            label: 'test-label-2',
            isActive: true,
            isPrimary: false,
            callback: jest.fn(),
            icon: null
          }
        ]

        render(
          <DownloadItem
            downloadId="download-id"
            downloadName="download-name"
            progress={progressObj}
            state="ACTIVE"
            primaryActionsList={primaryActionsList}
          />
        )

        expect(screen.queryByText('test-label-1')).toBeInTheDocument()
        expect(screen.queryByText('test-label-2')).not.toBeInTheDocument()
      })
    })

    describe('when clicking the dropdown button', () => {
      test('opens the dropdown component', async () => {
        const dropdownActionsList = [
          [
            {
              label: 'test-label',
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
            dropdownActionsList={dropdownActionsList}
          />
        )
        const dropdownTrigger = screen.getByTestId('dropdown-trigger')

        await userEvent.click(dropdownTrigger)
        expect(screen.queryByText('test-label')).toBeInTheDocument()
      })

      describe('when selecting a dropdown option', () => {
        test('fires the function callback', async () => {
          const dropdownActionsList = [
            [
              {
                label: 'test-label',
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
              dropdownActionsList={dropdownActionsList}
            />
          )
          const dropdownTrigger = screen.getByTestId('dropdown-trigger')

          await userEvent.click(dropdownTrigger)
          const testButton = screen.queryByText('test-label')
          await userEvent.click(testButton)

          expect(dropdownActionsList[0][0].onSelect).toHaveBeenCalledTimes(1)
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
        />
      )

      expect(screen.getByText('Paused')).toBeInTheDocument()
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
        />
      )

      expect(screen.getByText('Completed')).toBeInTheDocument()
    })
  })
})
