// TODO look into why this mock isnt working

import { render } from '@testing-library/react'
import React, { useContext, createContext } from 'react'

import AppContext from '../AppContext'

jest.mock('react', () => ({
  ...jest.requireActual('react'),
  createContext: jest.fn().mockImplementation(() => ({ woop: 'woop' }))
}))

describe('AppContext', () => {
  test.skip('creates the context', async () => {
    const TestComponent = () => {
      const context = useContext(AppContext)
      console.log('context', context)
    }

    render(<TestComponent />)

    console.log('createContext', createContext)

    expect(createContext).toHaveBeenCalledTimes(1)
  })
})
