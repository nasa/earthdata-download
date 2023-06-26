import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'

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
jest.mock('../../../dialogs/Settings/Settings', () => jest.fn(({ children }) => (
  <mock-Settings data-testid="Settings">
    {children}
  </mock-Settings>
)))

import { ElectronApiContext } from '../../../context/ElectronApiContext'

import Downloads from '../../../pages/Downloads/Downloads'
import DownloadHistory from '../../../pages/DownloadHistory/DownloadHistory'
import Settings from '../../../dialogs/Settings/Settings'

describe('Layout component', () => {
  test('renders the downloads page', () => {
    render(
      <ElectronApiContext.Provider value={{
        isWin: false,
        isMac: true,
        isLinux: false,
        windowsLinuxTitleBar: jest.fn(),
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
        isMac: true,
        isLinux: false,
        windowsLinuxTitleBar: jest.fn(),
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
        isMac: true,
        isLinux: false,
        windowsLinuxTitleBar: jest.fn(),
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
        isMac: true,
        isLinux: false,
        windowsLinuxTitleBar: jest.fn(),
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

  test('Settings dialog modal can be escaped using Radix close', async () => {
    const user = userEvent.setup()

    render(
      <ElectronApiContext.Provider value={{
        isWin: false,
        isMac: true,
        isLinux: false,
        windowsLinuxTitleBar: jest.fn(),
        closeWindow: jest.fn(),
        minimizeWindow: jest.fn(),
        maximizeWindow: jest.fn()
      }}
      >
        <Layout />
      </ElectronApiContext.Provider>
    )

    await user.click(screen.getByTestId('layout-button-settings'))

    expect(Settings).toHaveBeenCalledTimes(1)
    expect(screen.getByTestId('dialog-button-close')).toBeInTheDocument()
  })

  test('renders the settings button on a mac', () => {
    render(
      <ElectronApiContext.Provider value={{
        isWin: false,
        isMac: true,
        isLinux: false,
        windowsLinuxTitleBar: jest.fn(),
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
        isMac: false,
        isLinux: false,
        windowsLinuxTitleBar: jest.fn(),
        closeWindow: jest.fn(),
        minimizeWindow: jest.fn(),
        maximizeWindow: jest.fn()
      }}
      >
        <Layout />
      </ElectronApiContext.Provider>
    )

    expect(screen.getByTestId('layout-header').className).not.toContain('isMac')
  })

  test('renders the window buttons on Windows', () => {
    render(
      <ElectronApiContext.Provider value={{
        isWin: true,
        isMac: false,
        isLinux: false,
        windowsLinuxTitleBar: jest.fn(),
        closeWindow: jest.fn(),
        minimizeWindow: jest.fn(),
        maximizeWindow: jest.fn()
      }}
      >
        <Layout />
      </ElectronApiContext.Provider>
    )

    expect(screen.getByTestId('window-buttons').className).toContain('windowButtons')
  })

  // Skipping this for now as we do not know how to check the event onWindowMaximize
  test.skip('renders a restore button on Windows when the window is maximized', async () => {
    const user = userEvent.setup()
    const maximizeWindowMock = jest.fn()

    render(
      <ElectronApiContext.Provider
        value={{
          isWin: false,
          isMac: false,
          isLinux: true,
          windowsLinuxTitleBar: jest.fn(),
          closeWindow: jest.fn(),
          minimizeWindow: jest.fn(),
          maximizeWindow: maximizeWindowMock
        }}
      >
        <Layout />
      </ElectronApiContext.Provider>
    )

    await user.click(screen.getByTestId('maximize-restore-window'))

    expect(maximizeWindowMock).toHaveBeenCalledTimes(1)
  })

  test('renders the window buttons on Linux', () => {
    render(
      <ElectronApiContext.Provider value={{
        isWin: false,
        isMac: false,
        isLinux: true,
        windowsLinuxTitleBar: jest.fn(),
        closeWindow: jest.fn(),
        minimizeWindow: jest.fn(),
        maximizeWindow: jest.fn()
      }}
      >
        <Layout />
      </ElectronApiContext.Provider>
    )

    expect(screen.getByTestId('window-buttons').className).toContain('windowButtons')
  })

  test('does not render the window buttons on Mac', () => {
    render(
      <ElectronApiContext.Provider value={{
        isWin: false,
        isMac: true,
        isLinux: false,
        windowsLinuxTitleBar: jest.fn(),
        closeWindow: jest.fn(),
        minimizeWindow: jest.fn(),
        maximizeWindow: jest.fn()
      }}
      >
        <Layout />
      </ElectronApiContext.Provider>
    )

    expect(screen.getByTestId('layout-header').className).not.toContain('windowButtons')
  })

  test('clicking the close button sends a message to the main process', async () => {
    const user = userEvent.setup()
    const closeWindowMock = jest.fn()

    render(
      <ElectronApiContext.Provider value={{
        isWin: true,
        windowsLinuxTitleBar: jest.fn(),
        isMac: false,
        isLinux: false,
        closeWindow: closeWindowMock,
        minimizeWindow: jest.fn(),
        maximizeWindow: jest.fn()
      }}
      >
        <Layout />
      </ElectronApiContext.Provider>
    )

    await user.click(screen.getByTestId('close-window'))

    expect(closeWindowMock).toHaveBeenCalledTimes(1)
  })

  test('clicking the maximize/restore button sends a message to the main process', async () => {
    const user = userEvent.setup()
    const maximizeWindowMock = jest.fn()

    render(
      <ElectronApiContext.Provider value={{
        isWin: true,
        isMac: false,
        isLinux: false,
        windowsLinuxTitleBar: jest.fn(),
        closeWindow: jest.fn(),
        minimizeWindow: jest.fn(),
        maximizeWindow: maximizeWindowMock
      }}
      >
        <Layout />
      </ElectronApiContext.Provider>
    )

    await user.click(screen.getByTestId('maximize-restore-window'))

    expect(maximizeWindowMock).toHaveBeenCalledTimes(1)
  })

  test('clicking the minimize button sends a message to the main process', async () => {
    const user = userEvent.setup()
    const minimizeWindowMock = jest.fn()

    render(
      <ElectronApiContext.Provider value={{
        isWin: true,
        isMac: false,
        isLinux: false,
        windowsLinuxTitleBar: jest.fn(),
        closeWindow: jest.fn(),
        minimizeWindow: minimizeWindowMock,
        maximizeWindow: jest.fn()
      }}
      >
        <Layout />
      </ElectronApiContext.Provider>
    )

    await user.click(screen.getByTestId('minimize-window'))

    expect(minimizeWindowMock).toHaveBeenCalledTimes(1)
  })
})
