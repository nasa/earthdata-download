import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import userEvent from '@testing-library/user-event'

import * as RadixDropdown from '@radix-ui/react-dropdown-menu'

import DropdownItem from '../DropdownItem'

const setup = (overrideProps) => {
  const callback = jest.fn()
  const setDidClickToClose = jest.fn()

  const props = {
    callback,
    disabled: false,
    label: 'Mock Item',
    setDidClickToClose,
    ...overrideProps
  }

  render(
    <RadixDropdown.Root>
      <RadixDropdown.Content forceMount>
        <DropdownItem {...props} />
      </RadixDropdown.Content>
    </RadixDropdown.Root>
  )

  return {
    callback,
    setDidClickToClose
  }
}

describe('DropdownItem component', () => {
  test('renders the menu item', () => {
    setup()

    expect(screen.getByRole('menuitem', { name: 'Mock Item' })).toBeInTheDocument()
  })

  test('clicking the menu item calls the callback and setDidClickToClose', async () => {
    const {
      callback,
      setDidClickToClose
    } = setup()

    const button = screen.getByRole('menuitem', { name: 'Mock Item' })

    await userEvent.click(button)

    expect(callback).toHaveBeenCalledTimes(1)
    expect(setDidClickToClose).toHaveBeenCalledTimes(1)
    expect(setDidClickToClose).toHaveBeenCalledWith(true)
  })
})
