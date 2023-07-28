import React from 'react'

import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'

import WaitingForEula from '../WaitingForEula'
import { ElectronApiContext } from '../../../context/ElectronApiContext'

const setup = () => {
  const sendToEula = jest.fn()

  render(
    <ElectronApiContext.Provider
      value={
        {
          sendToEula
        }
      }
    >
      <WaitingForEula
        downloadId="download-id"
      />
    </ElectronApiContext.Provider>
  )

  return {
    sendToEula
  }
}

describe('WaitingForEula component', () => {
  test('renders the WaitingForEula dialog page', () => {
    setup()

    expect(screen.getByTestId('waiting-for-eula-accept-eula')).toHaveTextContent('View & Accept License Agreement')
  })

  test('clicking the Accept EULA button sends a message to the main process', async () => {
    const user = userEvent.setup()

    const { sendToEula } = setup()

    await user.click(screen.getByTestId('waiting-for-eula-accept-eula'))

    expect(sendToEula).toHaveBeenCalledTimes(1)
    expect(sendToEula).toHaveBeenCalledWith({
      downloadId: 'download-id',
      forceLogin: true
    })
  })
})
