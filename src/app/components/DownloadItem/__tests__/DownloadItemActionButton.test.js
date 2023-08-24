import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import userEvent from '@testing-library/user-event'

import DownloadItemActionButton from '../DownloadItemActionButton'

const setup = (overrideProps) => {
  const callback = jest.fn()

  const props = {
    callback,
    label: 'Mock Button',
    buttonProps: {
      className: 'mock-class'
    },
    ...overrideProps
  }

  render(
    <DownloadItemActionButton {...props} />
  )

  return {
    callback
  }
}

describe('DownloadItemActionButton component', () => {
  test('renders a button', () => {
    setup()

    expect(screen.getByRole('button', { name: 'Mock Button' })).toBeInTheDocument()
  })

  test('clicking calls the callback', async () => {
    const { callback } = setup()

    const button = screen.getByRole('button', { name: 'Mock Button' })

    await userEvent.click(button)

    expect(callback).toHaveBeenCalledTimes(1)
  })
})
