import React from 'react'

import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'

import WaitingForLogin from '../WaitingForLogin'
import { ElectronApiContext } from '../../../context/ElectronApiContext'

const setup = () => {
  const sendToLogin = jest.fn()

  render(
    <ElectronApiContext.Provider
      value={
        {
          sendToLogin
        }
      }
    >
      <WaitingForLogin
        downloadId="download-id"
      />
    </ElectronApiContext.Provider>
  )

  return {
    sendToLogin
  }
}

describe('WaitingForLogin component', () => {
  test('renders the WaitingForLogin dialog page', () => {
    setup()

    expect(screen.getByTestId('waiting-for-login-log-in-with-edl')).toHaveTextContent('Log In with Earthdata Login')
  })

  test('clicking the Log In with Earthdata Login button sends a message to the main process', async () => {
    const user = userEvent.setup()

    const { sendToLogin } = setup()

    await user.click(screen.getByTestId('waiting-for-login-log-in-with-edl'))

    expect(sendToLogin).toHaveBeenCalledTimes(1)
    expect(sendToLogin).toHaveBeenCalledWith({ downloadId: 'download-id', forceLogin: true })
  })
})
