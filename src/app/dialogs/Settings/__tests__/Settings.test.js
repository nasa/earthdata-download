import React from 'react'

import {
  render,
  screen,
  waitFor
} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'

import Settings from '../Settings'

import { ElectronApiContext } from '../../../context/ElectronApiContext'

const currentlyDownloadingText = 'Files currently downloading will not be affected by changes to settings'

const setup = (
  hasActiveDownloads,
  settingsDialogIsOpen,
  getPreferenceFieldValue
) => {
  // We need to mock hasActiveDownloads to render warning
  const mockHasActiveDownloads = hasActiveDownloads
  const mockSettingsDialogIsOpen = settingsDialogIsOpen
  const chooseDownloadLocation = jest.fn()
  const setDownloadLocation = jest.fn()
  const setPreferenceFieldValue = jest.fn()
  const getPreferenceFieldValueMock = getPreferenceFieldValue
    || jest.fn((field) => {
      if (field === 'concurrentDownloads') return 5
      if (field === 'defaultDownloadLocation') return null

      return null
    })

  const { rerender } = render(
    <ElectronApiContext.Provider value={
      {
        chooseDownloadLocation,
        setDownloadLocation,
        setPreferenceFieldValue,
        getPreferenceFieldValue: getPreferenceFieldValueMock
      }
    }
    >
      <Settings
        hasActiveDownloads={mockHasActiveDownloads}
        settingsDialogIsOpen={mockSettingsDialogIsOpen}
      />
    </ElectronApiContext.Provider>
  )

  return {
    rerender,
    chooseDownloadLocation,
    setDownloadLocation,
    setPreferenceFieldValue,
    getPreferenceFieldValue
  }
}

describe('Settings dialog', () => {
  test('renders the Settings modal page including the element if there are active downloads', async () => {
    const hasActiveDownloads = true
    const settingsDialogIsOpen = true

    setup(hasActiveDownloads, settingsDialogIsOpen)

    await waitFor(() => {
      expect(screen.getByText('Files currently downloading will not be affected by changes to settings')).toBeInTheDocument()
    })
  })

  test('renders the Settings modal page excluding active downloads', async () => {
    const hasActiveDownloads = false
    const settingsDialogIsOpen = true

    setup(hasActiveDownloads, settingsDialogIsOpen)

    await waitFor(() => {
    // Can't use getByTestId, that returns an error instead of null
      expect(screen.queryByText(currentlyDownloadingText)).not.toBeInTheDocument()
    })
  })

  test('Clicking the download location sends a message to the main process', async () => {
    const user = userEvent.setup()
    const hasActiveDownloads = true
    const settingsDialogIsOpen = true

    const { chooseDownloadLocation } = setup(hasActiveDownloads, settingsDialogIsOpen)

    const setDownloadLocation = await screen.findByText('Choose download location')

    await user.click(setDownloadLocation)

    await waitFor(() => {
      expect(chooseDownloadLocation).toHaveBeenCalledTimes(1)
    })
  })

  test('Clicking on the `Clear default download location` sends a message to the main process', async () => {
    const user = userEvent.setup()
    const hasActiveDownloads = true
    const settingsDialogIsOpen = true
    const getPreferenceFieldValueMock = jest.fn((field) => {
      if (field === 'concurrentDownloads') return 5
      if (field === 'defaultDownloadLocation') return '/test/location/'

      return null
    })

    const { setPreferenceFieldValue } = setup(
      hasActiveDownloads,
      settingsDialogIsOpen,
      getPreferenceFieldValueMock
    )

    const clearDownloadLocationButton = await screen.findByText('Clear download location')

    await user.click(clearDownloadLocationButton)

    await waitFor(() => {
      screen.getByText('Choose download location')
      expect(setPreferenceFieldValue).toHaveBeenCalledTimes(1)
      expect(setPreferenceFieldValue).toHaveBeenCalledWith({
        field: 'defaultDownloadLocation',
        value: null
      })
    })
  })

  test('Typing into the input field for the concurrency will trigger a call to main process', async () => {
    const user = userEvent.setup()
    const hasActiveDownloads = true
    const settingsDialogIsOpen = true

    const { setPreferenceFieldValue } = setup(hasActiveDownloads, settingsDialogIsOpen)

    await user.type(screen.getByLabelText('Simultaneous Downloads'), '{backspace}')
    await user.type(screen.getByLabelText('Simultaneous Downloads'), '3')
    // Trigger blur by leaving the text field
    await user.tab()

    await waitFor(() => {
      expect(setPreferenceFieldValue).toHaveBeenCalledTimes(1)
      // Ensure that the string argument to being converted to a numerical
      expect(setPreferenceFieldValue).toHaveBeenCalledWith({
        field: 'concurrentDownloads',
        value: 3
      })
    })
  })

  test('Typing a value < 1 or characters into the text field will result in no calls', async () => {
    const user = userEvent.setup()
    const hasActiveDownloads = true
    const settingsDialogIsOpen = true
    const { setPreferenceFieldValue } = setup(hasActiveDownloads, settingsDialogIsOpen)
    await user.type(screen.getByLabelText('Simultaneous Downloads'), '{backspace}')
    await user.type(screen.getByLabelText('Simultaneous Downloads'), '-')
    await user.type(screen.getByLabelText('Simultaneous Downloads'), 'a')
    await user.type(screen.getByLabelText('Simultaneous Downloads'), '0')
    // Trigger blur by leaving the text field
    await user.tab()

    await waitFor(() => {
      // Negative values or non-numerical changes to the input should not attempt to change the json store
      expect(setPreferenceFieldValue).toHaveBeenCalledTimes(0)
    })
  })

  test('Deleting the value in the field and leaving focus will not call a store change', async () => {
    const user = userEvent.setup()
    const hasActiveDownloads = true
    const settingsDialogIsOpen = true
    const { setPreferenceFieldValue } = setup(hasActiveDownloads, settingsDialogIsOpen)
    await user.type(screen.getByLabelText('Simultaneous Downloads'), '{backspace}')
    // Trigger blur by leaving the text field
    await user.tab()

    await waitFor(() => {
    // Leaving the text field empty will not update the store
      expect(setPreferenceFieldValue).toHaveBeenCalledTimes(0)
    })
  })

  test('Changing the concurrency field and then closing dialog still causes change to store', async () => {
    const setDownloadLocation = jest.fn()
    const setPreferenceFieldValue = jest.fn()
    const getPreferenceFieldValue = () => 5

    // Render
    const { rerender } = render(
      <ElectronApiContext.Provider value={
        {
          setDownloadLocation,
          setPreferenceFieldValue,
          getPreferenceFieldValue
        }
      }
      >
        <Settings
          hasActiveDownloads={false}
          settingsDialogIsOpen
        />
      </ElectronApiContext.Provider>
    )
    const user = userEvent.setup()
    await user.type(screen.getByLabelText('Simultaneous Downloads'), '{backspace}')
    await user.type(screen.getByLabelText('Simultaneous Downloads'), '6')

    // Re-render
    rerender(
      <ElectronApiContext.Provider value={
        {
          setDownloadLocation,
          setPreferenceFieldValue,
          getPreferenceFieldValue
        }
      }
      >
        <Settings
          hasActiveDownloads={false}
          settingsDialogIsOpen={false}
        />
      </ElectronApiContext.Provider>
    )

    await waitFor(() => {
      expect(setPreferenceFieldValue).toHaveBeenCalledTimes(1)
      expect(setPreferenceFieldValue).toHaveBeenCalledWith({
        field: 'concurrentDownloads',
        value: 6
      })
    })
  })
})
