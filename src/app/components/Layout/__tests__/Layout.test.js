import React from 'react'

import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import Layout from '../Layout'

jest.mock('../../../pages/Downloads/Downloads', () => jest.fn(({ children }) => (
  <mock-Downloads data-testid="Downloads">
    {children}
  </mock-Downloads>
)))
jest.mock('../../../pages/DownloadHistory/DownloadHistory', () => jest.fn(({ children }) => (
  <mock-DownloadHistory data-testid="DownloadHistory">
    {children}
  </mock-DownloadHistory>
)))
jest.mock('../../../pages/Settings/Settings', () => jest.fn(({ children }) => (
  <mock-Settings data-testid="Settings">
    {children}
  </mock-Settings>
)))

import { ElectronApiContext } from '../../../context/ElectronApiContext'

import Downloads from '../../../pages/Downloads/Downloads'
import DownloadHistory from '../../../pages/DownloadHistory/DownloadHistory'
import Settings from '../../../pages/Settings/Settings'

describe('Layout component', () => {
  test('renders the downloads page', () => {
    render(
      <ElectronApiContext.Provider value={{
        isWin: false,
        windowsLinuxTitleBar: jest.fn(),
        isMac: true,
        closeWindow: jest.fn(),
        minimizeWindow: jest.fn(),
        maximizeWindow: jest.fn()
      }}
      >
        <Layout />
      </ElectronApiContext.Provider>
    )

    expect(Downloads).toHaveBeenCalledTimes(1)
  })

  test.skip('renders the downloads page when clicking the nav button', async () => {
    // Skipping because the nav buttons are hidden until EDD-18
    const user = userEvent.setup()

    render(
      <ElectronApiContext.Provider value={{
        isWin: false,
        windowsLinuxTitleBar: jest.fn(),
        isMac: true,
        closeWindow: jest.fn(),
        minimizeWindow: jest.fn(),
        maximizeWindow: jest.fn()
      }}
      >
        <Layout />
      </ElectronApiContext.Provider>
    )

    expect(Downloads).toHaveBeenCalledTimes(1)

    await user.click(screen.getByTestId('layout-button-downloadHistory'))

    expect(DownloadHistory).toHaveBeenCalledTimes(1)

    await user.click(screen.getByTestId('layout-button-downloads'))

    expect(Downloads).toHaveBeenCalledTimes(2)
  })

  test.skip('renders the download history page when clicking the nav button', async () => {
    // Skipping because the nav buttons are hidden until EDD-18
    const user = userEvent.setup()

    render(
      <ElectronApiContext.Provider value={{
        isWin: false,
        windowsLinuxTitleBar: jest.fn(),
        isMac: true,
        closeWindow: jest.fn(),
        minimizeWindow: jest.fn(),
        maximizeWindow: jest.fn()
      }}
      >
        <Layout />
      </ElectronApiContext.Provider>
    )

    expect(Downloads).toHaveBeenCalledTimes(1)

    await user.click(screen.getByTestId('layout-button-downloadHistory'))

    expect(DownloadHistory).toHaveBeenCalledTimes(1)
  })

  test('renders the settings page when clicking the nav button', async () => {
    const user = userEvent.setup()

    render(
      <ElectronApiContext.Provider value={{
        isWin: false,
        windowsLinuxTitleBar: jest.fn(),
        isMac: true,
        closeWindow: jest.fn(),
        minimizeWindow: jest.fn(),
        maximizeWindow: jest.fn()
      }}
      >
        <Layout />
      </ElectronApiContext.Provider>
    )

    expect(Downloads).toHaveBeenCalledTimes(1)

    await user.click(screen.getByTestId('layout-button-settings'))

    expect(Settings).toHaveBeenCalledTimes(1)
  })

  test('renders the settings button on a mac', () => {
    render(
      <ElectronApiContext.Provider value={{
        isWin: false,
        windowsLinuxTitleBar: jest.fn(),
        isMac: true,
        closeWindow: jest.fn(),
        minimizeWindow: jest.fn(),
        maximizeWindow: jest.fn()
      }}
      >
        <Layout />
      </ElectronApiContext.Provider>
    )

    expect(Downloads).toHaveBeenCalledTimes(1)

    expect(screen.getByTestId('layout-header').className).toContain('isMac')
  })

  test('renders the settings button on windows', () => {
    render(
      <ElectronApiContext.Provider value={{
        isWin: true,
        windowsLinuxTitleBar: jest.fn(),
        isMac: false,
        closeWindow: jest.fn(),
        minimizeWindow: jest.fn(),
        maximizeWindow: jest.fn()
      }}
      >
        <Layout />
      </ElectronApiContext.Provider>
    )

    expect(screen.getByTestId('windows-layout-header').className).not.toContain('isMac')
  })
})
