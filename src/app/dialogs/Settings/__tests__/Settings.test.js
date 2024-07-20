import React from 'react'

import {
  render,
  screen,
  waitFor
} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'

import Settings from '../Settings'

import { ElectronApiContext } from '../../../context/ElectronApiContext'

const currentlyDownloadingText = 'Files currently downloading will not be affected by changes to settings'

const setup = (overrideProps = {}, overrideContext = {}) => {
  const user = userEvent.setup()

  const props = {
    hasActiveDownloads: false,
    setDefaultDownloadLocation: jest.fn(),
    setResetDialogOpen: jest.fn(),
    settingsDialogIsOpen: true,
    ...overrideProps
  }

  const context = {
    chooseDownloadLocation: jest.fn(),
    getAppVersion: jest.fn().mockResolvedValue('v1.0.0'),
    getPreferenceFieldValue: jest.fn((field) => {
      if (field === 'concurrentDownloads') return 5
      if (field === 'defaultDownloadLocation') return null

      return null
    }),
    openLogFolder: jest.fn(),
    setDownloadLocation: jest.fn(),
    setPreferenceFieldValue: jest.fn(),
    ...overrideContext
  }

  const { rerender } = render(
    <ElectronApiContext.Provider value={{ ...context }}>
      <Settings {...props} />
    </ElectronApiContext.Provider>
  )

  return {
    context,
    props,
    rerender,
    user
  }
}

describe('Settings dialog', () => {
  describe('when there are no active downloads', () => {
    test('renders the Settings modal', async () => {
      setup()

      expect(await screen.findByText('Earthdata Download Version: v1.0.0')).toBeInTheDocument()
      expect(screen.queryByText(currentlyDownloadingText)).not.toBeInTheDocument()
    })
  })

  describe('when there are active downloads', () => {
    test('renders the Settings modal', async () => {
      setup({
        hasActiveDownloads: true
      })

      expect(await screen.findByText('Earthdata Download Version: v1.0.0')).toBeInTheDocument()
      expect(screen.getByText(currentlyDownloadingText)).toBeInTheDocument()
    })
  })

  describe('when clicking the download location', () => {
    test('calls chooseDownloadLocation', async () => {
      const { context, user } = setup()

      const setDownloadLocation = await screen.findByText('Choose download location')

      await user.click(setDownloadLocation)

      expect(context.chooseDownloadLocation).toHaveBeenCalledTimes(1)
      expect(context.chooseDownloadLocation).toHaveBeenCalledWith()
    })
  })

  describe('when clicking on Clear Download Location', () => {
    test('calls setPreferenceFieldValue', async () => {
      const { context, user } = setup({
        defaultDownloadLocation: '/test/location'
      })

      const button = screen.getByRole('button', { name: 'Clear download location' })
      await user.click(button)

      expect(context.setPreferenceFieldValue).toHaveBeenCalledTimes(1)
      expect(context.setPreferenceFieldValue).toHaveBeenCalledWith({
        field: 'defaultDownloadLocation',
        value: null
      })
    })
  })

  describe('when modifying the Simultaneous Downloads field', () => {
    describe('when typing a number into the Simultaneous Downloads field', () => {
      test('calls setPreferenceFieldValue', async () => {
        const { context, user } = setup()

        await user.type(screen.getByLabelText('Simultaneous Downloads'), '{backspace}3')
        await user.tab()

        expect(context.setPreferenceFieldValue).toHaveBeenCalledTimes(1)
        // Ensure that the string argument to being converted to a numerical
        expect(context.setPreferenceFieldValue).toHaveBeenCalledWith({
          field: 'concurrentDownloads',
          value: 3
        })
      })
    })

    describe('when typing characters into the Simultaneous Downloads field', () => {
      test('does not call setPreferenceFieldValue', async () => {
        const { context, user } = setup()

        await user.type(screen.getByLabelText('Simultaneous Downloads'), '{backspace}a')
        await user.tab()

        expect(context.setPreferenceFieldValue).toHaveBeenCalledTimes(0)
      })
    })

    describe('when removing the value from the Simultaneous Downloads field', () => {
      test('does not call setPreferenceFieldValue', async () => {
        const { context, user } = setup()

        await user.type(screen.getByLabelText('Simultaneous Downloads'), '{backspace}')
        await user.tab()

        expect(context.setPreferenceFieldValue).toHaveBeenCalledTimes(0)
      })
    })

    describe('when changing the value but closing the modal before bluring', () => {
      test('calls setPreferenceFieldValue', async () => {
        const {
          context,
          props,
          rerender,
          user
        } = setup()

        await user.type(screen.getByLabelText('Simultaneous Downloads'), '{backspace}6')

        expect(context.setPreferenceFieldValue).toHaveBeenCalledTimes(0)

        rerender(
          <ElectronApiContext.Provider value={{ ...context }}>
            <Settings
              {...props}
              settingsDialogIsOpen={false}
            />
          </ElectronApiContext.Provider>
        )

        await waitFor(() => {
          expect(context.setPreferenceFieldValue).toHaveBeenCalledTimes(1)
        })

        expect(context.setPreferenceFieldValue).toHaveBeenCalledWith({
          field: 'concurrentDownloads',
          value: 6
        })
      })
    })
  })

  describe('when changing the Send Usage Metrics option', () => {
    test('calls setPreferenceFieldValue', async () => {
      const { context, user } = setup()

      const metricsSelect = screen.getByLabelText('Send Usage Metrics')
      await user.selectOptions(metricsSelect, 'Yes')

      expect(context.setPreferenceFieldValue).toHaveBeenCalledTimes(1)
      expect(context.setPreferenceFieldValue).toHaveBeenCalledWith({
        field: 'allowMetrics',
        value: 1
      })
    })
  })

  describe('when clicking the Open Log Folder button', () => {
    test('calls openLogFolder', async () => {
      const { context, user } = setup()

      const button = screen.getByRole('button', { name: 'Open Log Folder' })
      await user.click(button)

      expect(context.openLogFolder).toHaveBeenCalledTimes(1)
      expect(context.openLogFolder).toHaveBeenCalledWith()
    })
  })

  describe('when clicking the Reset Application button', () => {
    test('calls setResetDialogOpen', async () => {
      const { props, user } = setup()

      const button = screen.getByRole('button', { name: 'Reset Application' })
      await user.click(button)

      expect(props.setResetDialogOpen).toHaveBeenCalledTimes(1)
      expect(props.setResetDialogOpen).toHaveBeenCalledWith(true)
    })
  })
})
