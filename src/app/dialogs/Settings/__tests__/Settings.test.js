import React from 'react'

import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'

import Settings from '../Settings'
import { ElectronApiContext } from '../../../context/ElectronApiContext'

const setup = () => {
  // we need to mock hasActiveDownloads
  const mockHasActiveDownloads = true
  // todo we may need more of these functions to be mocked
  const chooseDownloadLocation = jest.fn()
  const setDownloadLocation = jest.fn()
  const setPreferenceFieldValue = jest.fn()
  const getPreferenceFieldValue = jest.fn()

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
// todo we need a test that checks if modal can close
// todo test that when you fill in the label it will kick off a call to the
// todo set and get methods for preference fields
// todo test that values < 1 can't be entered into the label

describe('Settings dialog', () => {
  test('renders the Settings modal page', () => {
    setup()

    expect(screen.getByTestId('settings-hasActiveDownloads')).toBeInTheDocument()
  })

  test('clicking the download location sends a message to the main process', async () => {
    const user = userEvent.setup()

    const { chooseDownloadLocation } = setup()

    await user.click(screen.getByTestId('initialize-download-location'))

    expect(chooseDownloadLocation).toHaveBeenCalledTimes(1)
  })
  // todo we should make sure it is calling the right function with the argument
  test('clicking on the `Clear default download location` sends a message to the main process', async () => {
    const user = userEvent.setup()
    const { setPreferenceFieldValue } = setup()

    await user.click(screen.getByTestId('settings-clear-default-download'))

    expect(setPreferenceFieldValue).toHaveBeenCalledTimes(1)
    expect(setPreferenceFieldValue).toHaveBeenCalledWith('defaultDownloadLocation', undefined)
  })

  // todo need to resolve number being set in input field
  test.skip('Typing into the input field for the concurrency will trigger a call to main process', async () => {
    const user = userEvent.setup()

    const { setPreferenceFieldValue } = setup()
    // await user.clear(screen.getByTestId('input-test-id'))
    // expect(screen.getByTestId('input-test-id')).toHaveValue('')
    // Enter 2 into the concurrency input
    // await user.click(screen.getByTestId('input-test-id'))
    await user.type(screen.getByTestId('input-test-id'), '{ArrowUp}')

    // userEvent.type(input1, { key: 'ArrowUp', which: 38, keyCode: 38 })

    expect(screen.getByTestId('input-test-id')).toHaveFocus()
    // await user.keyboard('ArrowUp')
    // await user.type(screen.getByTestId('input-test-id'), '[ArrowUp]')
    expect(setPreferenceFieldValue).toHaveBeenCalledTimes(1)
    // Ensure that the string argument to being converted to a numerical
    expect(setPreferenceFieldValue).toHaveBeenCalledWith('concurrentDownloads', 2)
  })

  test('Typing a value < 1 into the text field will result in no calls', async () => {
    const user = userEvent.setup()

    const { setPreferenceFieldValue } = setup()

    await user.type(screen.getByTestId('input-test-id'), '-')
    await user.type(screen.getByTestId('input-test-id'), 'a')
    // negative values or non-numerical changes to the input should not attempt to change the json store
    expect(setPreferenceFieldValue).toHaveBeenCalledTimes(0)
  })
})
