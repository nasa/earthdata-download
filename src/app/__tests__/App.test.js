import React from 'react'
import {
  render,
  screen,
  waitFor
} from '@testing-library/react'
import '@testing-library/jest-dom'

import App from '../App'

describe('App component', () => {
  test('renders an empty list', async () => {
    render(<App />)

    await waitFor(() => {
      expect(true)
    })

    expect(screen.getByText('No downloads in progress')).toBeInTheDocument()
    expect(screen.getByRole('button', { value: 'Find data in Earthdata Search' })).toBeInTheDocument()
  })
})
