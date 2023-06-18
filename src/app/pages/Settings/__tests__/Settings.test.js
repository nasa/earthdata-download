import React from 'react'

import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'

import Settings from '../Settings'
import { ElectronApiContext } from '../../../context/ElectronApiContext'

const setup = () => {
  const clearDefaultDownload = jest.fn()
  const deleteCookies = jest.fn()

  render(
    <ElectronApiContext.Provider value={{
      clearDefaultDownload,
      deleteCookies
    }}
    >
      <Settings />
    </ElectronApiContext.Provider>
  )

  return {
    clearDefaultDownload,
    deleteCookies
  }
}

describe('Settings component', () => {
  test('renders the downloads page', () => {
    setup()

    expect(screen.getByText('Settings')).toBeInTheDocument()
  })

  test('clicking on the `Clear default download location` sends a message to the main process', async () => {
    const user = userEvent.setup()

    const { clearDefaultDownload } = setup()

    await user.click(screen.getByTestId('settings-clear-default-download'))

    expect(clearDefaultDownload).toHaveBeenCalledTimes(1)
  })

  test('clicking on the `Delete cookies` sends a message to the main process', async () => {
    const user = userEvent.setup()

    const { deleteCookies } = setup()

    await user.click(screen.getByTestId('settings-delete-cookies'))

    expect(deleteCookies).toHaveBeenCalledTimes(1)
  })
})
