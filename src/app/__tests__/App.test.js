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
    expect(screen.getByRole('link', { value: 'Find data in Earthdata Search' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'View Download History' })).toBeInTheDocument()

    expect(screen.getByRole('button', { name: 'Downloads' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Download History' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Settings' })).toBeInTheDocument()
  })
})
