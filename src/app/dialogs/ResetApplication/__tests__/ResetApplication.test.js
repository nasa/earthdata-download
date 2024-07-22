import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'

import ResetApplication from '../ResetApplication'
import { ElectronApiContext } from '../../../context/ElectronApiContext'

const setup = () => {
  const user = userEvent.setup()
  const resetApplication = jest.fn()

  render(
    <ElectronApiContext.Provider
      value={
        {
          resetApplication
        }
      }
    >
      <ResetApplication />
    </ElectronApiContext.Provider>
  )

  return {
    resetApplication,
    user
  }
}

describe('ResetApplication component', () => {
  describe('when the input value is not correct', () => {
    test('the reset button is disabled', () => {
      setup()

      const button = screen.getByRole('button', { name: 'Reset Application' })

      expect(button).toHaveAttribute('disabled')
    })
  })

  describe('when clicking the reset button', () => {
    test('calls resetApplication', async () => {
      const { resetApplication, user } = setup()

      const input = screen.getByLabelText('Reset Application')
      await user.type(input, 'reset application')

      const button = screen.getByRole('button', { name: 'Reset Application' })
      await user.click(button)

      expect(resetApplication).toHaveBeenCalledTimes(1)
      expect(resetApplication).toHaveBeenCalledWith()
    })
  })
})
