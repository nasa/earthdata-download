import React from 'react'

import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'

import DownloadHistory from '../DownloadHistory'

describe('DownloadHistory component', () => {
  test('renders the downloads page', () => {
    const setCurrentPage = jest.fn()
    render(
      <DownloadHistory setCurrentPage={setCurrentPage} />
    )

    expect(screen.getByText('Download history is empty')).toBeInTheDocument()
  })
})
