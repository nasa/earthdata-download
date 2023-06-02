import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import userEvent from '@testing-library/user-event'

import DownloadDropdown from '../DownloadDropdown'
import downloadStates from '../../../constants/downloadStates'

const setup = (overrideProps) => {
  const props = {
    onPauseDownload: jest.fn(),
    onResumeDownload: jest.fn(),
    onCancelDownload: jest.fn(),
    onOpenDownloadFolder: jest.fn(),
    state: downloadStates.active,
    finishedFiles: 1,
    ...overrideProps
  }
  render(
    <DownloadDropdown {...props} />
  )
}

describe('DownloadDropdown component', () => {
  test('renders a dropdown menu', async () => {
    setup()

    const trigger = screen.queryByRole('button')
    await userEvent.click(trigger)

    expect(screen.queryByText('Pause Download')).toBeInTheDocument()
    expect(screen.queryByText('Cancel Download')).toBeInTheDocument()
  })

  test('renders dropdown menu when extra dropdown options are passed in', async () => {
    const overrideProps = {
      children: [
        [{
          label: 'test-option',
          onSelect: () => jest.fn()
        }]
      ]
    }

    setup(overrideProps)

    const trigger = screen.queryByRole('button')
    await userEvent.click(trigger)

    expect(screen.queryByText('Pause Download')).toBeInTheDocument()
    expect(screen.queryByText('Cancel Download')).toBeInTheDocument()
    expect(screen.queryByText('test-option')).toBeInTheDocument()
  })

  describe('when a dropdown option is picked', () => {
    test('associated function is triggered', async () => {
      const prop = {
        onCancelDownload: jest.fn()
      }
      setup(prop)
      const trigger = screen.queryByRole('button')
      await userEvent.click(trigger)

      const cancelOption = screen.queryByText('Cancel Download')
      await userEvent.click(cancelOption)

      expect(prop.onCancelDownload).toHaveBeenCalledTimes(1)
    })
  })

  describe('when downloadItem state changes', () => {
    test('when state is paused, render resume option', async () => {
      setup({
        state: downloadStates.paused
      })
      const trigger = screen.queryByRole('button')
      await userEvent.click(trigger)

      expect(screen.queryByText('Pause Download')).not.toBeInTheDocument()
      expect(screen.queryByText('Resume Download')).toBeInTheDocument()
    })

    test('when state is completed, remove pause option', async () => {
      setup({
        state: downloadStates.completed
      })
      const trigger = screen.queryByRole('button')
      await userEvent.click(trigger)

      expect(screen.queryByText('Open Folder')).toBeInTheDocument()
      expect(screen.queryByText('Pause Download')).not.toBeInTheDocument()
    })
  })

  describe('when dropdown is closed', () => {
    test('dropdown menu options are not visible after clicking a dropdown option', async () => {
      setup()

      const trigger = screen.queryByRole('button')
      await userEvent.click(trigger)
      const pauseOption = screen.queryByText('Pause Download')
      await userEvent.click(pauseOption)

      expect(screen.queryByText('Pause Download')).not.toBeInTheDocument()
      expect(screen.queryByText('Cancel Download')).not.toBeInTheDocument()
    })
  })
})
