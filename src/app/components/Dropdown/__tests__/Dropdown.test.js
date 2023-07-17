import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import userEvent from '@testing-library/user-event'

import Dropdown from '../Dropdown'

describe('Dropdown component', () => {
  test('renders a dropdown menu', async () => {
    const actionsList = [
      [
        {
          label: 'test-label',
          isActive: true,
          isPrimary: true,
          callback: jest.fn(),
          icon: null
        }
      ]
    ]
    render(
      <Dropdown actionsList={actionsList} />
    )

    const trigger = screen.queryByRole('button')
    await userEvent.click(trigger)

    expect(screen.queryByText('test-label')).toBeInTheDocument()
  })

  describe('when a dropdown option is picked', () => {
    test('associated function is triggered', async () => {
      const actionsList = [
        [
          {
            label: 'test-label',
            isActive: true,
            isPrimary: true,
            callback: jest.fn(),
            icon: null
          }
        ]
      ]
      render(
        <Dropdown actionsList={actionsList} />
      )

      const trigger = screen.queryByRole('button')
      await userEvent.click(trigger)

      const testButton = screen.queryByText('test-label')
      await userEvent.click(testButton)

      expect(actionsList[0][0].callback).toHaveBeenCalledTimes(1)
    })
  })
})
