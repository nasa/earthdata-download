import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import userEvent from '@testing-library/user-event'

import Dropdown from '../Dropdown'

describe('Dropdown component', () => {
  test('renders a dropdown menu', async () => {
    const moreActions = [
      [
        {
          label: 'Pause Download',
          onSelect: () => {},
          visible: true,
          disabled: false
        }
      ]
    ]
    render(
      <Dropdown moreActions={moreActions} />
    )

    const trigger = screen.queryByRole('button')
    await userEvent.click(trigger)
    screen.debug()

    expect(screen.queryByText('Pause Download')).toBeInTheDocument()
  })

  describe('when a dropdown option is picked', () => {
    test('associated function is triggered', async () => {
      const moreActions = [
        [
          {
            label: 'Pause Download',
            onSelect: jest.fn(),
            visible: true,
            disabled: false
          }
        ]
      ]
      render(
        <Dropdown moreActions={moreActions} />
      )
      const trigger = screen.queryByRole('button')
      await userEvent.click(trigger)

      const pauseOption = screen.queryByText('Pause Download')
      await userEvent.click(pauseOption)

      expect(moreActions[0][0].onSelect).toHaveBeenCalledTimes(1)
    })
  })
})
