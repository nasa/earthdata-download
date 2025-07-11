import React from 'react'
import {
  render,
  screen,
  waitFor
} from '@testing-library/react'
import '@testing-library/jest-dom'
import userEvent from '@testing-library/user-event'

import { FaPause } from 'react-icons/fa'

import DownloadItem from '../DownloadItem'
import { ElectronApiContext } from '../../../context/ElectronApiContext'
import downloadStates from '../../../constants/downloadStates'
import { PAGES } from '../../../constants/pages'
import Progress from '../../Progress/Progress'

jest.mock('../../Progress/Progress', () => jest.fn(() => (
  <mock-Progress data-testid="Progress" />
)))

const setup = (overrideProps) => {
  const showWaitingForEulaDialog = jest.fn()
  const showWaitingForLoginDialog = jest.fn()
  const setCurrentPage = jest.fn()
  const setSelectedDownloadId = jest.fn()

  const props = {
    actionsList: [],
    downloadId: 'download-id',
    itemName: 'Test download',
    percent: 42,
    setCurrentPage,
    setSelectedDownloadId,
    state: downloadStates.active,
    ...overrideProps
  }

  const { container } = render(
    <ElectronApiContext.Provider
      value={
        {
          showWaitingForEulaDialog,
          showWaitingForLoginDialog
        }
      }
    >
      <DownloadItem {...props} />
    </ElectronApiContext.Provider>
  )

  return {
    container,
    setCurrentPage,
    setSelectedDownloadId,
    showWaitingForEulaDialog,
    showWaitingForLoginDialog
  }
}

describe('DownloadItem component', () => {
  describe('when a download is starting', () => {
    test('displays the correct download information', () => {
      const { container } = setup({
        percent: 0,
        state: downloadStates.starting
      })

      expect(screen.getByRole('heading', {
        level: 3,
        value: 'Test download'
      })).toBeInTheDocument()

      expect(screen.getByRole('listitem')).toHaveClass('wrapper isStarting')

      expect(Progress).toHaveBeenCalledTimes(1)
      expect(Progress).toHaveBeenCalledWith({
        className: 'progress',
        progress: 0,
        state: downloadStates.starting
      }, {})

      expect(container.getElementsByClassName('progressBackground')[0]).toHaveStyle('width: 0%')
    })

    test('the download item is not clickable', async () => {
      const { setSelectedDownloadId, setCurrentPage } = setup({
        state: downloadStates.starting
      })

      const fileDownloadsPortal = screen.getByTestId('download-item-open-file-downloads')
      expect(fileDownloadsPortal).toBeInTheDocument()

      await userEvent.click(fileDownloadsPortal)

      expect(setCurrentPage).toHaveBeenCalledTimes(0)
      expect(setSelectedDownloadId).toHaveBeenCalledTimes(0)
    })
  })

  describe('when a download is pending', () => {
    test('displays the correct download information', () => {
      const { container } = setup({
        percent: 0,
        state: downloadStates.pending
      })

      expect(screen.getByRole('heading', {
        level: 3,
        value: 'Test download'
      })).toBeInTheDocument()

      expect(screen.getByRole('listitem')).toHaveClass('wrapper isPending')

      expect(Progress).toHaveBeenCalledTimes(1)
      expect(Progress).toHaveBeenCalledWith({
        className: 'progress',
        progress: 0,
        state: downloadStates.pending
      }, {})

      expect(container.getElementsByClassName('progressBackground')[0]).toHaveStyle('width: 0%')
    })

    test('the download item is not clickable', async () => {
      const { setSelectedDownloadId, setCurrentPage } = setup({
        state: downloadStates.pending,
        loadingMoreFiles: true
      })

      const fileDownloadsPortal = screen.getByTestId('download-item-open-file-downloads')
      expect(fileDownloadsPortal).toBeInTheDocument()

      await userEvent.click(fileDownloadsPortal)

      expect(setCurrentPage).toHaveBeenCalledTimes(0)

      expect(setSelectedDownloadId).toHaveBeenCalledTimes(0)
    })
  })

  describe('when a download is active', () => {
    test('displays the correct download information', () => {
      const { container } = setup()

      expect(screen.getByRole('heading', {
        level: 3,
        value: 'Test download'
      })).toBeInTheDocument()

      expect(screen.getByRole('listitem')).toHaveClass('wrapper isActive')

      expect(Progress).toHaveBeenCalledTimes(1)
      expect(Progress).toHaveBeenCalledWith({
        className: 'progress',
        progress: 42,
        state: downloadStates.active
      }, {})

      expect(container.getElementsByClassName('progressBackground')[0]).toHaveStyle('width: 42%')
    })

    describe('when clicking on the `DownloadItem`', () => {
      test('calls `setCurrentPage` and `setSelectedDownloadId` ', async () => {
        const { setSelectedDownloadId, setCurrentPage } = setup({
          state: downloadStates.active,
          shouldBeClickable: true
        })

        const fileDownloadsPortal = screen.getByTestId('download-item-open-file-downloads')
        expect(fileDownloadsPortal).toBeInTheDocument()

        await userEvent.click(fileDownloadsPortal)

        expect(setCurrentPage).toHaveBeenCalledTimes(1)
        expect(setCurrentPage).toHaveBeenCalledWith(PAGES.fileDownloads)

        expect(setSelectedDownloadId).toHaveBeenCalledTimes(1)
        expect(setSelectedDownloadId).toHaveBeenCalledWith('download-id')
      })
    })

    describe('when pressing enter on the `DownloadItem`', () => {
      test('calls setCurrentPage and setSelectedDownloadId', async () => {
        const { setSelectedDownloadId, setCurrentPage } = setup({
          state: downloadStates.active,
          loadingMoreFiles: true,
          shouldBeClickable: true
        })

        // Focus screen on the `div-button` then trigger onKeyDown
        screen.getByTestId('download-item-open-file-downloads').focus()

        await userEvent.keyboard('{Enter}')

        expect(setCurrentPage).toHaveBeenCalledTimes(1)
        expect(setCurrentPage).toHaveBeenCalledWith(PAGES.fileDownloads)

        expect(setSelectedDownloadId).toHaveBeenCalledTimes(1)
        expect(setSelectedDownloadId).toHaveBeenCalledWith('download-id')
      })
    })

    describe('when pressing spacebar on the `DownloadItem`', () => {
      test('calls setCurrentPage and setSelectedDownloadId', async () => {
        const { setSelectedDownloadId, setCurrentPage } = setup({
          state: downloadStates.active,
          loadingMoreFiles: true,
          shouldBeClickable: true
        })

        // Focus screen on the `div-button` then trigger onKeyDown
        screen.getByTestId('download-item-open-file-downloads').focus()

        // Refers to Spacebar key
        await userEvent.keyboard(' ')

        expect(setCurrentPage).toHaveBeenCalledTimes(1)
        expect(setCurrentPage).toHaveBeenCalledWith(PAGES.fileDownloads)

        expect(setSelectedDownloadId).toHaveBeenCalledTimes(1)
        expect(setSelectedDownloadId).toHaveBeenCalledWith('download-id')
      })
    })

    describe('when pressing a non-enter key on the `DownloadItem`', () => {
      test('does not call setCurrentPage or setSelectedDownloadId', async () => {
        const { setSelectedDownloadId, setCurrentPage } = setup({
          state: downloadStates.active,
          loadingMoreFiles: true
        })

        // Focus screen on the `div-button` then fail to trigger onKeyDown because key is not 'Enter' or 'Spacebar'
        screen.getByTestId('download-item-open-file-downloads').focus()
        await userEvent.keyboard('{a}')

        expect(setCurrentPage).toHaveBeenCalledTimes(0)
        expect(setSelectedDownloadId).toHaveBeenCalledTimes(0)
      })
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

      setup({
        actionsList
      })

      const testButton = screen.getByText('test-label')

      await userEvent.click(testButton)

      expect(actionsList[0][0].callback).toHaveBeenCalledTimes(1)
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

        setup({
          actionsList
        })

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

        setup({
          actionsList
        })

        const dropdownTrigger = screen.getByRole('button', { name: 'More Actions' })

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

          setup({
            actionsList
          })

          const dropdownTrigger = screen.getByRole('button', { name: 'More Actions' })

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
      const { container } = setup({
        percent: 42,
        state: downloadStates.paused
      })

      expect(screen.getByRole('heading', {
        level: 3,
        value: 'Test download'
      })).toBeInTheDocument()

      expect(screen.getByRole('listitem')).toHaveClass('wrapper isPaused')

      expect(Progress).toHaveBeenCalledTimes(1)
      expect(Progress).toHaveBeenCalledWith({
        className: 'progress',
        progress: 42,
        state: downloadStates.paused
      }, {})

      expect(container.getElementsByClassName('progressBackground')[0]).toHaveStyle('width: 42%')
    })
  })

  describe('when a download is completed', () => {
    test('displays the correct download information', () => {
      const { container } = setup({
        percent: 100,
        state: downloadStates.completed
      })

      expect(screen.getByRole('heading', {
        level: 3,
        value: 'Test download'
      })).toBeInTheDocument()

      expect(screen.getByRole('listitem')).toHaveClass('wrapper isCompleted')

      expect(Progress).toHaveBeenCalledTimes(1)
      expect(Progress).toHaveBeenCalledWith({
        className: 'progress',
        progress: 100,
        state: downloadStates.completed
      }, {})

      expect(container.getElementsByClassName('progressBackground')[0]).toHaveStyle('width: 100%')
    })
  })

  describe('when a download has errors', () => {
    test('displays the correct download information', () => {
      const { container } = setup({
        percent: 0,
        state: downloadStates.error
      })

      expect(screen.getByRole('heading', {
        level: 3,
        value: 'Test download'
      })).toBeInTheDocument()

      expect(screen.getByRole('listitem')).toHaveClass('wrapper isError')

      expect(Progress).toHaveBeenCalledTimes(1)
      expect(Progress).toHaveBeenCalledWith({
        className: 'progress',
        progress: 0,
        state: downloadStates.error
      }, {})

      expect(container.getElementsByClassName('progressBackground')[0]).toHaveStyle('width: 0%')
    })
  })

  describe('when progressBar is set to false', () => {
    test('does not display the progress bar', () => {
      setup({
        percent: 100,
        state: downloadStates.completed,
        progressBar: false
      })

      expect(Progress).toHaveBeenCalledTimes(0)
      expect(screen.queryAllByRole('listitem').at(0)).toHaveClass('isWithoutProgress')
    })
  })

  describe('when hovering over the title', () => {
    test('displays a tooltip after 500 ms', async () => {
      setup({
        percent: 100,
        state: downloadStates.completed
      })

      const firstItem = screen.queryAllByTestId('download-item-name').at(0)

      await userEvent.hover(firstItem)

      await waitFor(() => {
        expect(screen.queryByRole('tooltip')).toHaveTextContent('Test download')
      })
    })
  })

  describe('when a subStatus is defined', () => {
    test('displays a tooltip after 500 ms', () => {
      setup({
        percent: 100,
        state: downloadStates.completed,
        subStatus: <>Sub status</>
      })

      expect(screen.queryByText('Sub status')).toBeInTheDocument()
    })
  })

  describe('when a primaryStatus is defined', () => {
    test('renders the primary status', () => {
      setup({
        percent: 100,
        state: downloadStates.completed,
        primaryStatus: <>Primary status</>
      })

      expect(screen.queryByText('Primary status')).toBeInTheDocument()
    })
  })

  describe('when a secondaryStatus is defined', () => {
    test('renders the primary status', () => {
      setup({
        percent: 100,
        state: downloadStates.completed,
        secondaryStatus: <>Secondary status</>
      })

      expect(screen.queryByText('Secondary status')).toBeInTheDocument()
    })
  })

  describe('when a tertiaryStatus is defined', () => {
    test('renders the tertiary status', () => {
      setup({
        percent: 100,
        state: downloadStates.completed,
        tertiaryStatus: <>Tertiary status</>
      })

      expect(screen.queryByText('Tertiary status')).toBeInTheDocument()
    })
  })

  describe('when actions is not defined', () => {
    test('does not render any actions', () => {
      setup({
        actionsList: undefined
      })

      expect(screen.queryAllByRole('button').length).toEqual(1)
      expect(screen.queryByText('More Actions')).not.toBeInTheDocument()
    })
  })

  describe('when a download failed to start', () => {
    test('displays the correct download information', () => {
      const { container } = setup({
        actionsList: [
          [
            {
              label: 'test-label',
              isActive: true,
              isPrimary: true,
              callback: jest.fn(),
              icon: FaPause
            }
          ]
        ],
        percent: 0,
        state: downloadStates.errorFetchingLinks
      })

      expect(screen.getByRole('heading', {
        level: 3,
        value: 'Test download'
      })).toBeInTheDocument()

      expect(screen.getByRole('listitem')).toHaveClass('wrapper isError')

      expect(Progress).toHaveBeenCalledTimes(1)
      expect(Progress).toHaveBeenCalledWith({
        className: 'progress',
        progress: 0,
        state: downloadStates.errorFetchingLinks
      }, {})

      expect(container.getElementsByClassName('progressBackground')[0]).toHaveStyle('width: 0%')

      expect(screen.queryByRole('button', { name: 'test-label' })).toBeInTheDocument()
    })
  })

  describe('when a download is in "interrupted" state', () => {
    test('displays the "Manually Download" button', async () => {
      const mockCallback = jest.fn()
      setup({
        actionsList: [
          [
            {
              label: 'Manually Download',
              isActive: true,
              isPrimary: false,
              callback: mockCallback
            }
          ]
        ],
        percent: 0,
        state: downloadStates.interruptedCanResume,
        downloadLinks: { 'download-id': ['https://example.com/file1.zip'] }
      })

      global.window.open = jest.fn()

      const manualDownloadButton = screen.getByText('Manually Download')
      expect(manualDownloadButton).toBeInTheDocument()

      await userEvent.click(manualDownloadButton)

      expect(global.window.open).toHaveBeenCalledWith('https://example.com/file1.zip', '_blank')
      expect(global.window.open).toHaveBeenCalledTimes(1)

      global.window.open.mockRestore()
    })
  })

  describe('when a download is not in an "interrupted" state', () => {
    test('the "Manually Download" button is not visible', async () => {
      const statesWhereButtonShouldNotAppear = [
        downloadStates.starting,
        downloadStates.active,
        downloadStates.paused,
        downloadStates.completed,
        downloadStates.error
      ]

      statesWhereButtonShouldNotAppear.forEach((state) => {
        setup({
          state,
          downloadLinks: { 'download-id': ['https://example.com/file1.zip'] }
        })

        const manualDownloadButton = screen.queryByText('Manually Download')
        expect(manualDownloadButton).not.toBeInTheDocument()
      })
    })
  })

  describe('when a download is waiting for authentication', () => {
    describe('when the download has not started yet', () => {
      test('displays the correct download information', () => {
        const { container } = setup({
          percent: 0,
          state: downloadStates.waitingForAuth
        })

        expect(screen.getByRole('heading', {
          level: 3,
          value: 'Test download'
        })).toBeInTheDocument()

        expect(screen.getByRole('listitem')).toHaveClass('wrapper isPending')

        expect(Progress).toHaveBeenCalledTimes(1)
        expect(Progress).toHaveBeenCalledWith({
          className: 'progress',
          progress: 0,
          state: downloadStates.waitingForAuth
        }, {})

        expect(container.getElementsByClassName('progressBackground')[0]).toHaveStyle('width: 0%')
      })
    })

    describe('when the download has some progress', () => {
      test('displays the correct download information', () => {
        const { container } = setup({
          state: downloadStates.waitingForAuth
        })

        expect(screen.getByRole('heading', {
          level: 3,
          value: 'Test download'
        })).toBeInTheDocument()

        expect(screen.getByRole('listitem')).toHaveClass('wrapper isInterrupted')

        expect(Progress).toHaveBeenCalledTimes(1)
        expect(Progress).toHaveBeenCalledWith({
          className: 'progress',
          progress: 42,
          state: downloadStates.waitingForAuth
        }, {})

        expect(container.getElementsByClassName('progressBackground')[0]).toHaveStyle('width: 42%')
      })
    })
  })

  describe('when a download is waiting for EULA acceptance', () => {
    describe('when the download has not started yet', () => {
      test('displays the correct download information', () => {
        const { container } = setup({
          percent: 0,
          state: downloadStates.waitingForEula
        })

        expect(screen.getByRole('heading', {
          level: 3,
          value: 'Test download'
        })).toBeInTheDocument()

        expect(screen.getByRole('listitem')).toHaveClass('wrapper isPending')

        expect(Progress).toHaveBeenCalledTimes(1)
        expect(Progress).toHaveBeenCalledWith({
          className: 'progress',
          progress: 0,
          state: downloadStates.waitingForEula
        }, {})

        expect(container.getElementsByClassName('progressBackground')[0]).toHaveStyle('width: 0%')
      })
    })

    describe('when the download has some progress', () => {
      test('displays the correct download information', () => {
        const { container } = setup({
          state: downloadStates.waitingForEula
        })

        expect(screen.getByRole('heading', {
          level: 3,
          value: 'Test download'
        })).toBeInTheDocument()

        expect(screen.getByRole('listitem')).toHaveClass('wrapper isInterrupted')

        expect(Progress).toHaveBeenCalledTimes(1)
        expect(Progress).toHaveBeenCalledWith({
          className: 'progress',
          progress: 42,
          state: downloadStates.waitingForEula
        }, {})

        expect(container.getElementsByClassName('progressBackground')[0]).toHaveStyle('width: 42%')
      })
    })
  })
})
