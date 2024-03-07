import React from 'react'
import {
  render,
  screen,
  waitFor
} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {
  FaCheck,
  FaBan,
  FaCog
} from 'react-icons/fa'
import '@testing-library/jest-dom'

import Layout from '../Layout'

import { ElectronApiContext } from '../../../context/ElectronApiContext'
import AppContext from '../../../context/AppContext'

import Downloads from '../../../pages/Downloads/Downloads'
import DownloadHistory from '../../../pages/DownloadHistory/DownloadHistory'
import Settings from '../../../dialogs/Settings/Settings'
import ToastList from '../../ToastList/ToastList'

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

jest.mock('../../../components/ToastList/ToastList', () => jest.fn(() => (
  <mock-ToastList data-testid="ToastList" />
)))

const setup = (overrideApiContextValue = {}, toasts = []) => {
  const addToast = jest.fn((toast) => toasts.push(toast))
  const closeWindow = jest.fn()
  const dismissToast = jest.fn()
  const getPreferenceFieldValue = jest.fn()
  const minimizeWindow = jest.fn()
  const maximizeWindow = jest.fn()
  const setPreferenceFieldValue = jest.fn()
  const showWaitingForEulaDialog = jest.fn()
  const showWaitingForLoginDialog = jest.fn()

  const apiContextValue = {
    isWin: false,
    isMac: true,
    isLinux: false,
    closeWindow,
    getPreferenceFieldValue,
    minimizeWindow,
    maximizeWindow,
    setPreferenceFieldValue,
    showWaitingForEulaDialog,
    showWaitingForLoginDialog,
    ...overrideApiContextValue
  }

  const callbacks = {
    initializeDownload: null,
    autoUpdateError: null
  }

  render(
    <ElectronApiContext.Provider value={
      {
        isWin: false,
        isMac: true,
        isLinux: false,
        autoUpdateAvailable: jest.fn(),
        autoUpdateInstallLater: jest.fn(),
        autoUpdateProgress: jest.fn(),
        autoUpdateError: jest.fn((on, callback) => {
          if (on) callbacks.autoUpdateError = callback
          else callbacks.autoUpdateError = null
        }),
        beginDownload: jest.fn(),
        initializeDownload: jest.fn((on, callback) => { callbacks.initializeDownload = callback }),
        setDownloadLocation: jest.fn(),
        windowsLinuxTitleBar: jest.fn(),
        ...apiContextValue
      }
    }
    >
      <AppContext.Provider value={
        {
          addToast,
          dismissToast,
          toasts
        }
      }
      >
        <Layout />
      </AppContext.Provider>
    </ElectronApiContext.Provider>
  )

  return {
    addToast,
    dismissToast,
    callbacks,
    getPreferenceFieldValue,
    closeWindow,
    minimizeWindow,
    maximizeWindow,
    toasts,
    setPreferenceFieldValue
  }
}

beforeEach(() => {
  jest.clearAllMocks()
})

describe('Layout component', () => {
  test('renders the downloads page', () => {
    setup()

    expect(Downloads).toHaveBeenCalledTimes(1)
  })

  test('renders the downloads page when clicking the nav button', async () => {
    const user = userEvent.setup()

    setup()

    expect(Downloads).toHaveBeenCalledTimes(1)

    await user.click(screen.getByTestId('layout-button-downloadHistory'))

    expect(DownloadHistory).toHaveBeenCalledTimes(1)

    await user.click(screen.getByTestId('layout-button-downloads'))

    expect(Downloads).toHaveBeenCalledTimes(2)
  })

  test('renders the download history page when clicking the nav button', async () => {
    const user = userEvent.setup()

    setup()

    expect(Downloads).toHaveBeenCalledTimes(1)

    await user.click(screen.getByTestId('layout-button-downloadHistory'))

    expect(DownloadHistory).toHaveBeenCalledTimes(1)
  })

  test('renders the settings page when clicking the nav button', async () => {
    const user = userEvent.setup()

    setup()

    expect(Downloads).toHaveBeenCalledTimes(1)

    await user.click(screen.getByText('Settings'))

    expect(Settings).toHaveBeenCalledTimes(1)
  })

  test('renders the settings button on a mac', () => {
    setup({ isMac: true })

    expect(Downloads).toHaveBeenCalledTimes(1)

    expect(screen.getByTestId('layout-header').className).toContain('isMac')
  })

  describe('when a new download is initialized', () => {
    describe('when the user has opted into metrics', () => {
      test('addToast is not called', async () => {
        const {
          callbacks,
          getPreferenceFieldValue,
          addToast
        } = setup()

        getPreferenceFieldValue.mockResolvedValueOnce(1)

        await waitFor(() => {
          callbacks.initializeDownload({ mock: 'event' }, {
            mock: 'info'
          })
        })

        await waitFor(() => {
          expect(getPreferenceFieldValue).toHaveBeenCalledTimes(1)
          expect(addToast).toHaveBeenCalledTimes(0)
        })
      })
    })

    describe('when the user has opted out of metrics', () => {
      test('addToast is not called', async () => {
        const { callbacks, getPreferenceFieldValue, addToast } = setup()

        getPreferenceFieldValue.mockResolvedValueOnce(2)

        await waitFor(() => {
          callbacks.initializeDownload({ mock: 'event' }, {
            mock: 'info'
          })
        })

        await waitFor(() => {
          expect(getPreferenceFieldValue).toHaveBeenCalledTimes(1)
          expect(addToast).toHaveBeenCalledTimes(0)
        })
      })
    })

    describe('when the user has not selected whether to opt into metrics', () => {
      test('addToast is called', async () => {
        const {
          addToast,
          callbacks,
          getPreferenceFieldValue
        } = setup()

        getPreferenceFieldValue.mockResolvedValueOnce(0)

        await waitFor(() => {
          callbacks.initializeDownload({ mock: 'event' }, {
            mock: 'info'
          })
        })

        await waitFor(() => {
          expect(addToast).toHaveBeenCalledTimes(1)
          expect(addToast).toHaveBeenCalledWith({
            showCloseButton: false,
            id: 'allow-metrics-id',
            message: 'Send Anonymous Usage Data?',
            variant: 'none',
            actions: [
              {
                altText: 'Allow',
                buttonText: 'Yes',
                buttonProps: {
                  Icon: FaCheck,
                  onClick: expect.any(Function)
                }
              },
              {
                altText: 'Opt-Out',
                buttonText: 'No',
                buttonProps: {
                  Icon: FaBan,
                  onClick: expect.any(Function)
                }
              },
              {
                altText: 'Settings',
                buttonText: 'Settings',
                buttonProps: {
                  Icon: FaCog,
                  onClick: expect.any(Function)
                }
              }
            ]
          })
        })
      })

      describe('when the user selects one of the metrics toast options', () => {
        describe('when user selects `Yes` to allow metrics', () => {
          test('setPreferenceFieldValue is called and toast is dismissed', async () => {
            const {
              addToast,
              callbacks,
              dismissToast,
              getPreferenceFieldValue,
              setPreferenceFieldValue,
              toasts
            } = setup()

            getPreferenceFieldValue.mockResolvedValueOnce(0)

            await waitFor(() => {
              callbacks.initializeDownload({ mock: 'event' }, {
                mock: 'info'
              })
            })

            await waitFor(() => {
              expect(addToast).toHaveBeenCalledTimes(1)
              expect(addToast).toHaveBeenCalledWith({
                showCloseButton: false,
                id: 'allow-metrics-id',
                message: 'Send Anonymous Usage Data?',
                variant: 'none',
                actions: [
                  {
                    altText: 'Allow',
                    buttonText: 'Yes',
                    buttonProps: {
                      Icon: FaCheck,
                      onClick: expect.any(Function)
                    }
                  },
                  {
                    altText: 'Opt-Out',
                    buttonText: 'No',
                    buttonProps: {
                      Icon: FaBan,
                      onClick: expect.any(Function)
                    }
                  },
                  {
                    altText: 'Settings',
                    buttonText: 'Settings',
                    buttonProps: {
                      Icon: FaCog,
                      onClick: expect.any(Function)
                    }
                  }
                ]
              })
            })

            expect(toasts).toHaveLength(1)
            const [toast] = toasts
            const { actions } = toast

            const allowButton = actions[0]
            const { buttonProps } = allowButton
            const { onClick } = buttonProps

            // Call the `metricsToastResponder` function
            await onClick()

            expect(dismissToast).toBeCalledTimes(1)
            expect(dismissToast).toHaveBeenCalledWith('allow-metrics-id')
            expect(setPreferenceFieldValue).toBeCalledTimes(2)
            expect(setPreferenceFieldValue).toHaveBeenLastCalledWith({
              field: 'allowMetrics',
              value: true
            })
          })
        })

        describe('when user selects `No` to opt-out of metrics', () => {
          test('setPreferenceFieldValue is called and toast is dismissed', async () => {
            const {
              addToast,
              callbacks,
              dismissToast,
              getPreferenceFieldValue,
              setPreferenceFieldValue,
              toasts
            } = setup()

            getPreferenceFieldValue.mockResolvedValueOnce(0)

            await waitFor(() => {
              callbacks.initializeDownload({ mock: 'event' }, {
                mock: 'info'
              })
            })

            await waitFor(() => {
              expect(addToast).toHaveBeenCalledTimes(1)
              expect(addToast).toHaveBeenCalledWith({
                showCloseButton: false,
                id: 'allow-metrics-id',
                message: 'Send Anonymous Usage Data?',
                variant: 'none',
                actions: [
                  {
                    altText: 'Allow',
                    buttonText: 'Yes',
                    buttonProps: {
                      Icon: FaCheck,
                      onClick: expect.any(Function)
                    }
                  },
                  {
                    altText: 'Opt-Out',
                    buttonText: 'No',
                    buttonProps: {
                      Icon: FaBan,
                      onClick: expect.any(Function)
                    }
                  },
                  {
                    altText: 'Settings',
                    buttonText: 'Settings',
                    buttonProps: {
                      Icon: FaCog,
                      onClick: expect.any(Function)
                    }
                  }
                ]
              })
            })

            expect(toasts).toHaveLength(1)
            const [toast] = toasts
            const { actions } = toast

            const allowButton = actions[1]
            const { buttonProps } = allowButton
            const { onClick } = buttonProps

            // Call the `metricsToastResponder` function
            await onClick()

            expect(dismissToast).toBeCalledTimes(1)
            expect(dismissToast).toHaveBeenCalledWith('allow-metrics-id')
            expect(setPreferenceFieldValue).toBeCalledTimes(2)
            expect(setPreferenceFieldValue).toHaveBeenCalledWith({
              field: 'allowMetrics',
              value: false
            })
          })
        })

        describe('when user selects `Settings` from the toast options', () => {
          test('setPreferenceFieldValue is not called, toast is dismissed, and settings modal opens', async () => {
            const {
              addToast,
              callbacks,
              dismissToast,
              getPreferenceFieldValue,
              setPreferenceFieldValue,
              toasts
            } = setup()

            getPreferenceFieldValue.mockResolvedValueOnce(0)

            await waitFor(() => {
              callbacks.initializeDownload({ mock: 'event' }, {
                mock: 'info'
              })
            })

            await waitFor(() => {
              expect(addToast).toHaveBeenCalledTimes(1)
              expect(addToast).toHaveBeenCalledWith({
                showCloseButton: false,
                id: 'allow-metrics-id',
                message: 'Send Anonymous Usage Data?',
                variant: 'none',
                actions: [
                  {
                    altText: 'Allow',
                    buttonText: 'Yes',
                    buttonProps: {
                      Icon: FaCheck,
                      onClick: expect.any(Function)
                    }
                  },
                  {
                    altText: 'Opt-Out',
                    buttonText: 'No',
                    buttonProps: {
                      Icon: FaBan,
                      onClick: expect.any(Function)
                    }
                  },
                  {
                    altText: 'Settings',
                    buttonText: 'Settings',
                    buttonProps: {
                      Icon: FaCog,
                      onClick: expect.any(Function)
                    }
                  }
                ]
              })
            })

            expect(toasts).toHaveLength(1)
            const [toast] = toasts
            const { actions } = toast

            const allowButton = actions[2]
            const { buttonProps } = allowButton
            const { onClick } = buttonProps

            // Call the `metricsToastResponder` function
            await waitFor(() => {
              onClick()
            })

            expect(dismissToast).toBeCalledTimes(1)
            expect(dismissToast).toHaveBeenCalledWith('allow-metrics-id')
            expect(setPreferenceFieldValue).toBeCalledTimes(0)

            // Ensure Settings modal is brought up
            const modalTitle = screen.getAllByText('Settings')[1]
            expect(modalTitle).toBeInTheDocument()
            expect(modalTitle).toHaveClass('title')
          })
        })
      })
    })
  })

  describe('auto-update error handling', () => {
    test('displays error toast with manual download option on auto-update error', async () => {
      global.window.open = jest.fn()
      const errorMessage = 'Failed to download update'
      const { callbacks, addToast } = setup()

      await waitFor(() => {
        callbacks.autoUpdateError(true, new Error(errorMessage))
      })

      await waitFor(() => {
        expect(addToast).toHaveBeenCalledWith(expect.objectContaining({
          id: 'auto-update-error',
          title: 'Auto-Update Failure',
          message: 'Failed to download latest update. Download new version manually',
          variant: 'error',
          actions: expect.arrayContaining([
            expect.objectContaining({
              buttonText: 'Manual Download',
              buttonProps: expect.objectContaining({
                Icon: expect.any(Function),
                onClick: expect.any(Function)
              })
            })
          ])
        }))
      })

      const onClickFunction = addToast.mock.calls[0][0].actions[0].buttonProps.onClick

      onClickFunction()

      expect(window.open).toHaveBeenCalledWith('https://github.com/nasa/earthdata-download/releases/latest', '_blank')
    })
  })

  test('renders the settings button on windows', () => {
    setup({
      isMac: false,
      isWin: true
    })

    expect(screen.getByTestId('layout-header').className).not.toContain('isMac')
  })

  test('renders the window buttons on Windows', () => {
    setup({
      isMac: false,
      isWin: true
    })

    expect(screen.getByTestId('window-buttons').className).toContain('windowButtons')
  })

  // Skipping this for now as we do not know how to check the event onWindowMaximize
  test.skip('renders a restore button on Windows when the window is maximized', async () => {
    const user = userEvent.setup()
    const maximizeWindowMock = jest.fn()

    setup({
      isMac: false,
      isWin: true
    })

    await user.click(screen.getByTestId('maximize-restore-window'))

    expect(maximizeWindowMock).toHaveBeenCalledTimes(1)
  })

  test('renders the window buttons on Linux', () => {
    setup({
      isMac: false,
      isLinux: true
    })

    expect(screen.getByTestId('window-buttons').className).toContain('windowButtons')
  })

  test('does not render the window buttons on Mac', () => {
    setup()

    expect(screen.getByTestId('layout-header').className).not.toContain('windowButtons')
  })

  test('clicking the close button sends a message to the main process', async () => {
    const user = userEvent.setup()

    const { closeWindow } = setup({
      isMac: false,
      isWin: true
    })

    await user.click(screen.getByTestId('close-window'))

    expect(closeWindow).toHaveBeenCalledTimes(1)
  })

  test('clicking the maximize/restore button sends a message to the main process', async () => {
    const user = userEvent.setup()

    const { maximizeWindow } = setup({
      isMac: false,
      isWin: true
    })

    await user.click(screen.getByTestId('maximize-restore-window'))

    expect(maximizeWindow).toHaveBeenCalledTimes(1)
  })

  test('clicking the minimize button sends a message to the main process', async () => {
    const user = userEvent.setup()

    const { minimizeWindow } = setup({
      isMac: false,
      isWin: true
    })

    await user.click(screen.getByTestId('minimize-window'))

    expect(minimizeWindow).toHaveBeenCalledTimes(1)
  })

  test('settings dialog modal can be escaped using Radix close', async () => {
    const user = userEvent.setup()

    setup()

    await user.click(screen.getByRole('button', { name: 'Settings' }))

    expect(Settings).toHaveBeenCalledTimes(1)

    const modalTitle = screen.getAllByText('Settings')[1]
    expect(modalTitle).toBeInTheDocument()
    expect(modalTitle).toHaveClass('title')
  })

  describe('when toasts are not defined in the app context', () => {
    test('renders the ToastList with the correct props', async () => {
      setup()

      // Rendering twice because of setPageComponent being called within the useEffect
      expect(ToastList).toHaveBeenCalledTimes(2)
      expect(ToastList).toHaveBeenCalledWith(expect.objectContaining({
        toasts: []
      }), {})
    })
  })

  describe('when toasts are defined in the app context', () => {
    test('renders the ToastList with the correct props', async () => {
      setup({}, {
        activeToasts: {
          'mock-toast-id': {
            id: 'mock-toast-id',
            message: 'Mock toast message'
          }
        }
      })

      // Rendering twice because of setPageComponent being called within the useEffect
      expect(ToastList).toHaveBeenCalledTimes(2)
      expect(ToastList).toHaveBeenCalledWith(expect.objectContaining({
        toasts: [
          expect.objectContaining({
            id: 'mock-toast-id'
          })
        ]
      }), {})
    })
  })
})
