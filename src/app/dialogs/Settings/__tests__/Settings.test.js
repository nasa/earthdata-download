/* eslint-disable react/jsx-closing-tag-location */
import React from 'react'

import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'

import Settings from '../Settings'
import { ElectronApiContext } from '../../../context/ElectronApiContext'

const setup = (hasActiveDownloads, settingsDialogIsOpen) => {
  // we need to mock hasActiveDownloads to render warning
  const mockHasActiveDownloads = hasActiveDownloads
  const mockSettingsDialogIsOpen = settingsDialogIsOpen
  const chooseDownloadLocation = jest.fn()
  const setDownloadLocation = jest.fn()
  const setPreferenceFieldValue = jest.fn()
  const getPreferenceFieldValue = () => 5
  const { rerender } = render(
    <ElectronApiContext.Provider value={{
      chooseDownloadLocation,
      setDownloadLocation,
      setPreferenceFieldValue,
      getPreferenceFieldValue
    }}
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
      expect(screen.getByTestId('settings-hasActiveDownloads')).toBeInTheDocument()
    })
  })

  test('renders the Settings modal page excluding active downloads', async () => {
    const hasActiveDownloads = false
    const settingsDialogIsOpen = true
    setup(hasActiveDownloads, settingsDialogIsOpen)
    await waitFor(() => {
    // Can't use getByTestId, that returns an error instead of null
      expect(screen.queryByTestId('settings-hasActiveDownloads')).not.toBeInTheDocument()
    })
  })

  test('Clicking the download location sends a message to the main process', async () => {
    const user = userEvent.setup()
    const hasActiveDownloads = true
    const settingsDialogIsOpen = true

    const { chooseDownloadLocation } = setup(hasActiveDownloads, settingsDialogIsOpen)

    await user.click(screen.getByTestId('initialize-download-location'))

    await waitFor(() => {
      expect(screen.getByTestId('initialize-download-location')).toBeInTheDocument()
      expect(chooseDownloadLocation).toHaveBeenCalledTimes(1)
    })
  })

  test('Clicking on the `Clear default download location` sends a message to the main process', async () => {
    const user = userEvent.setup()
    const hasActiveDownloads = true
    const settingsDialogIsOpen = true
    const { setPreferenceFieldValue } = setup(hasActiveDownloads, settingsDialogIsOpen)

    await user.click(screen.getByTestId('settings-clear-default-download'))

    await waitFor(() => {
      expect(setPreferenceFieldValue).toHaveBeenCalledTimes(1)
      expect(setPreferenceFieldValue).toHaveBeenCalledWith('defaultDownloadLocation', undefined)
    })
  })

  test('Typing into the input field for the concurrency will trigger a call to main process', async () => {
    const user = userEvent.setup()
    const hasActiveDownloads = true
    const settingsDialogIsOpen = true

    const { setPreferenceFieldValue } = setup(hasActiveDownloads, settingsDialogIsOpen)

    await user.type(screen.getByTestId('input-test-id'), '{backspace}')
    await user.type(screen.getByTestId('input-test-id'), '3')
    // trigger blur by leaving the text field
    await user.tab()

    await waitFor(() => {
      expect(setPreferenceFieldValue).toHaveBeenCalledTimes(1)
      // Ensure that the string argument to being converted to a numerical
      expect(setPreferenceFieldValue).toHaveBeenCalledWith('concurrentDownloads', 3)
    })
  })

  test('Typing a value < 1 or characters into the text field will result in no calls', async () => {
    const user = userEvent.setup()
    const hasActiveDownloads = true
    const settingsDialogIsOpen = true
    const { setPreferenceFieldValue } = setup(hasActiveDownloads, settingsDialogIsOpen)
    await user.type(screen.getByTestId('input-test-id'), '{backspace}')
    await user.type(screen.getByTestId('input-test-id'), '-')
    await user.type(screen.getByTestId('input-test-id'), 'a')
    await user.type(screen.getByTestId('input-test-id'), '0')
    // trigger blur by leaving the text field
    await user.tab()

    await waitFor(() => {
      // negative values or non-numerical changes to the input should not attempt to change the json store
      expect(setPreferenceFieldValue).toHaveBeenCalledTimes(0)
    })
  })

  test('Deleting the value in the field and leaving focus will not call a store change', async () => {
    const user = userEvent.setup()
    const hasActiveDownloads = true
    const settingsDialogIsOpen = true
    const { setPreferenceFieldValue } = setup(hasActiveDownloads, settingsDialogIsOpen)
    await user.type(screen.getByTestId('input-test-id'), '{backspace}')
    // trigger blur by leaving the text field
    await user.tab()

    await waitFor(() => {
    // leaving the text field empty will not update the store
      expect(setPreferenceFieldValue).toHaveBeenCalledTimes(0)
    })
  })

  test('Changing the concurrency field and then closing dialog still causes change to store', async () => {
    const setDownloadLocation = jest.fn()
    const setPreferenceFieldValue = jest.fn()
    const getPreferenceFieldValue = () => 5

    // render
    const { rerender } = render(
      <ElectronApiContext.Provider value={{
        setDownloadLocation,
        setPreferenceFieldValue,
        getPreferenceFieldValue
      }}
      >
        <Settings
          hasActiveDownloads={false}
          settingsDialogIsOpen
        />
      </ElectronApiContext.Provider>
    )
    const user = userEvent.setup()
    await user.type(screen.getByTestId('input-test-id'), '{backspace}')
    await user.type(screen.getByTestId('input-test-id'), '6')

    // re-render
    rerender(<ElectronApiContext.Provider value={{
      setDownloadLocation,
      setPreferenceFieldValue,
      getPreferenceFieldValue
    }}
    >
      <Settings
        hasActiveDownloads={false}
        settingsDialogIsOpen={false}
      />
    </ElectronApiContext.Provider>)

    await waitFor(() => {
      expect(setPreferenceFieldValue).toHaveBeenCalledTimes(1)
      expect(setPreferenceFieldValue).toHaveBeenCalledWith('concurrentDownloads', 6)
    })
  })
})
