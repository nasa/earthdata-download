import React from 'react'

import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import App from '../App'

// Example test to show jest working
// Remove once real app starts development
describe('App component', () => {
  test.skip('increments the couter', async () => {
    const user = userEvent.setup()

    render(
      <App />
    )

    expect(screen.getByTestId('count-button').textContent).toEqual('count is 0')

    await user.click(screen.getByTestId('count-button'))

    expect(screen.getByTestId('count-button').textContent).toEqual('count is 1')
  })
})
