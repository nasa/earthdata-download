import React from 'react'

import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'

import Downloads from '../Downloads'
import { ElectronApiContext } from '../../../context/ElectronApiContext'

describe('Downloads component', () => {
  test('renders the downloads page', () => {
    const setCurrentPage = jest.fn()
    const setDownloadLocation = jest.fn()
    const initializeDownload = jest.fn()

    render(
      <ElectronApiContext.Provider value={{ setDownloadLocation, initializeDownload }}>
        <Downloads setCurrentPage={setCurrentPage} />
      </ElectronApiContext.Provider>
    )

    expect(screen.getByText('No downloads in progress')).toBeInTheDocument()
  })
})
