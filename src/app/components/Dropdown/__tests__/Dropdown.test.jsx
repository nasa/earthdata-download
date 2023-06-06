import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import userEvent from '@testing-library/user-event'

import Dropdown from '../Dropdown'

describe('Dropdown component', () => {
  test('renders a dropdown menu', async () => {
    const dropdownActionsList = [
      [
        {
          label: 'test-label',
          onSelect: () => {},
          visible: true,
          disabled: false
        }
      ]
    ]
    render(
      <Dropdown dropdownActionsList={dropdownActionsList} />
    )

    const trigger = screen.queryByRole('button')
    await userEvent.click(trigger)

    expect(screen.queryByText('test-label')).toBeInTheDocument()
  })

  describe('when a dropdown option is picked', () => {
    test('associated function is triggered', async () => {
      const dropdownActionsList = [
        [
          {
            label: 'test-label',
            onSelect: jest.fn(),
            visible: true,
            disabled: false
          }
        ]
      ]
      render(
        <Dropdown dropdownActionsList={dropdownActionsList} />
      )
      const trigger = screen.queryByRole('button')
      await userEvent.click(trigger)

      const testButton = screen.queryByText('test-label')
      await userEvent.click(testButton)

      expect(dropdownActionsList[0][0].onSelect).toHaveBeenCalledTimes(1)
    })
  })
})
