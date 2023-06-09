import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import userEvent from '@testing-library/user-event'

import { FaPause } from 'react-icons/fa'

import DownloadItem from '../DownloadItem'

const progressObj = {
  percent: 0,
  finishedFiles: 0,
  totalFiles: 1,
  totalTime: 0
}

describe('DownloadItem component', () => {
  describe('when a download is pending', () => {
    test('displays the correct download information', () => {
      render(
        <DownloadItem
          downloadId="download-id"
          downloadName="download-name"
          progress={progressObj}
          loadingMoreFiles
          state="PENDING"
        />
      )

      expect(screen.getByTestId('download-item-name')).toHaveTextContent('download-name')
      expect(screen.queryByTestId('download-item-percent')).not.toBeInTheDocument()
      expect(screen.queryByTestId('download-item-status-description')).not.toBeInTheDocument()
      expect(screen.getByTestId('download-item-state')).toHaveTextContent('Initializing')
    })
  })

  describe('when a download is active', () => {
    test('displays the correct download information', () => {
      render(
        <DownloadItem
          downloadId="download-id"
          downloadName="download-name"
          progress={progressObj}
          state="ACTIVE"
        />
      )

      expect(screen.getByTestId('download-item-name')).toHaveTextContent('download-name')
      expect(screen.getByTestId('download-item-percent')).toHaveTextContent('0%')
      expect(screen.getByTestId('download-item-spinner')).toBeInTheDocument()
      expect(screen.getByTestId('download-item-state')).toHaveTextContent('Downloading')
      expect(screen.getByTestId('download-item-status-description')).toHaveTextContent('0 of 1 files done in 0 seconds')
    })

    describe('when more files are loading', () => {
      test('displays the correct download information', () => {
        render(
          <DownloadItem
            downloadId="download-id"
            downloadName="download-name"
            progress={progressObj}
            loadingMoreFiles
            state="ACTIVE"
          />
        )

        expect(screen.getByTestId('download-item-name')).toHaveTextContent('download-name')
        expect(screen.getByTestId('download-item-percent')).toHaveTextContent('0%')
        expect(screen.getByTestId('download-item-spinner')).toBeInTheDocument()
        expect(screen.getByTestId('download-item-state')).toHaveTextContent('Downloading')
        expect(screen.getByTestId('download-item-status-description')).toHaveTextContent('0 files done in 0 seconds (determining file count)')
      })
    })

    describe('when clicking a primary action button', () => {
      test('fires the action callback', async () => {
        const actionsList = [
          [
            {
              label: 'test-label',
              isActive: true,
              isPrimary: true,
              callback: jest.fn(),
              icon: FaPause
            }
          ]
        ]

        render(
          <DownloadItem
            downloadId="download-id"
            downloadName="download-name"
            progress={progressObj}
            state="ACTIVE"
            actionsList={actionsList}
          />
        )

        const testButton = screen.getByText('test-label')

        await userEvent.click(testButton)

        expect(actionsList[0][0].callback).toHaveBeenCalledTimes(1)
      })
    })

    describe('when generating primary actions', () => {
      test('if action is not primary it is not visible', async () => {
        const actionsList = [
          [
            {
              label: 'test-label-1',
              isActive: true,
              isPrimary: true,
              callback: jest.fn(),
              icon: FaPause
            },
            {
              label: 'test-label-2',
              isActive: true,
              isPrimary: false,
              callback: jest.fn(),
              icon: FaPause
            }
          ]
        ]

        render(
          <DownloadItem
            downloadId="download-id"
            downloadName="download-name"
            progress={progressObj}
            state="ACTIVE"
            actionsList={actionsList}
          />
        )

        expect(screen.queryByText('test-label-1')).toBeInTheDocument()
        expect(screen.queryByText('test-label-2')).not.toBeInTheDocument()
      })
    })

    describe('when clicking the dropdown button', () => {
      test('opens the dropdown component', async () => {
        const actionsList = [
          [
            {
              label: 'test-label',
              isActive: true,
              isPrimary: true,
              callback: jest.fn(),
              icon: FaPause
            }
          ]
        ]

        render(
          <DownloadItem
            downloadId="download-id"
            downloadName="download-name"
            progress={progressObj}
            state="ACTIVE"
            actionsList={actionsList}
          />
        )
        const dropdownTrigger = screen.getByTestId('dropdown-trigger')

        await userEvent.click(dropdownTrigger)

        expect(screen.getByRole('menuitem')).toBeInTheDocument()
      })

      describe('when selecting a dropdown option', () => {
        test('fires the function callback', async () => {
          const actionsList = [
            [
              {
                label: 'test-label',
                isActive: true,
                isPrimary: false,
                callback: jest.fn(),
                icon: FaPause
              }
            ]
          ]

          render(
            <DownloadItem
              downloadId="download-id"
              downloadName="download-name"
              progress={progressObj}
              state="ACTIVE"
              actionsList={actionsList}
            />
          )
          const dropdownTrigger = screen.getByTestId('dropdown-trigger')

          await userEvent.click(dropdownTrigger)
          const testButton = screen.getByRole('menuitem')
          await userEvent.click(testButton)

          expect(actionsList[0][0].callback).toHaveBeenCalledTimes(1)
        })
      })
    })
  })

  describe('when a download is paused', () => {
    test('displays the correct download information', () => {
      render(
        <DownloadItem
          downloadId="download-id"
          downloadName="download-name"
          progress={progressObj}
          state="PAUSED"
        />
      )

      expect(screen.getByTestId('download-item-name')).toHaveTextContent('download-name')
      expect(screen.getByTestId('download-item-percent')).toHaveTextContent('0%')
      expect(screen.queryByTestId('download-item-spinner')).not.toBeInTheDocument()
      expect(screen.getByTestId('download-item-state')).toHaveTextContent('Paused')
      expect(screen.getByTestId('download-item-status-description')).toHaveTextContent('0 of 1 files done in 0 seconds')
    })
  })

  describe('when a download is completed', () => {
    test('displays the correct download information', () => {
      render(
        <DownloadItem
          downloadId="download-id"
          downloadName="download-name"
          progress={{
            ...progressObj,
            finishedFiles: 1,
            percent: 100
          }}
          state="COMPLETED"
        />
      )

      expect(screen.getByTestId('download-item-name')).toHaveTextContent('download-name')
      expect(screen.getByTestId('download-item-percent')).toHaveTextContent('100%')
      expect(screen.queryByTestId('download-item-spinner')).not.toBeInTheDocument()
      expect(screen.getByTestId('download-item-state')).toHaveTextContent('Completed')
      expect(screen.getByTestId('download-item-status-description')).toHaveTextContent('1 of 1 files done in 0 seconds')
    })
  })
})
