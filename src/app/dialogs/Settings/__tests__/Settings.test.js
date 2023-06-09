import React from 'react'

import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'

import Settings from '../Settings'
import { ElectronApiContext } from '../../../context/ElectronApiContext'

const setup = () => {
  // we need to mock hasActiveDownloads
  const mockHasActiveDownloads = true
  const chooseDownloadLocation = jest.fn()
  const setDownloadLocation = jest.fn()
  const setPreferenceFieldValue = jest.fn()
  const getPreferenceFieldValue = () => 5

  render(
    <ElectronApiContext.Provider value={{
      chooseDownloadLocation,
      setDownloadLocation,
      setPreferenceFieldValue,
      getPreferenceFieldValue
    }}
    >
      <Settings
        hasActiveDownloads={mockHasActiveDownloads}
      />
    </ElectronApiContext.Provider>
  )

  return {
    chooseDownloadLocation,
    setDownloadLocation,
    setPreferenceFieldValue,
    getPreferenceFieldValue
  }
}

describe('Settings dialog', () => {
  test('renders the Settings modal page including the element if there are active downloads', () => {
    setup()
    expect(screen.getByTestId('settings-hasActiveDownloads')).toBeInTheDocument()
  })

  test('clicking the download location sends a message to the main process', async () => {
    const user = userEvent.setup()

    const { chooseDownloadLocation } = setup()

    await user.click(screen.getByTestId('initialize-download-location'))

    expect(chooseDownloadLocation).toHaveBeenCalledTimes(1)
  })

  test('clicking on the `Clear default download location` sends a message to the main process', async () => {
    const user = userEvent.setup()
    const { setPreferenceFieldValue } = setup()

    await user.click(screen.getByTestId('settings-clear-default-download'))

    expect(setPreferenceFieldValue).toHaveBeenCalledTimes(1)
    expect(setPreferenceFieldValue).toHaveBeenCalledWith('defaultDownloadLocation', undefined)
  })

  test('Typing into the input field for the concurrency will trigger a call to main process', async () => {
    const user = userEvent.setup()

    const { setPreferenceFieldValue } = setup()

    await user.type(screen.getByTestId('input-test-id'), '{backspace}')
    await user.type(screen.getByTestId('input-test-id'), '3')
    // trigger blur by leaving the text field
    await user.tab()
    expect(setPreferenceFieldValue).toHaveBeenCalledTimes(1)
    // Ensure that the string argument to being converted to a numerical
    expect(setPreferenceFieldValue).toHaveBeenCalledWith('concurrentDownloads', 3)
  })

  test('Typing a value < 1 or characters into the text field will result in no calls', async () => {
    const user = userEvent.setup()
    const { setPreferenceFieldValue } = setup()
    await user.type(screen.getByTestId('input-test-id'), '{backspace}')
    await user.type(screen.getByTestId('input-test-id'), '-')
    await user.type(screen.getByTestId('input-test-id'), 'a')
    await user.type(screen.getByTestId('input-test-id'), '0')
    // trigger blur by leaving the text field
    await user.tab()
    // negative values or non-numerical changes to the input should not attempt to change the json store
    expect(setPreferenceFieldValue).toHaveBeenCalledTimes(0)
  })

  test('Deleting the value in the field and leaving focus will not call a store change', async () => {
    const user = userEvent.setup()
    const { setPreferenceFieldValue } = setup()
    await user.type(screen.getByTestId('input-test-id'), '{backspace}')
    // trigger blur by leaving the text field
    await user.tab()
    // leaving the text field empty will not update the store
    expect(setPreferenceFieldValue).toHaveBeenCalledTimes(0)
  })
})
