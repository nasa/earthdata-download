import React from 'react'

import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'

import InitializeDownload from '../InitializeDownload'
import { ElectronApiContext } from '../../../context/ElectronApiContext'

const setup = () => {
  const beginDownload = jest.fn()
  const chooseDownloadLocation = jest.fn()
  const onCloseChooseLocationDialog = jest.fn()
  const deleteDownload = jest.fn()
  const setDownloadIds = jest.fn()

  render(
    <ElectronApiContext.Provider
      value={
        {
          beginDownload,
          chooseDownloadLocation,
          deleteDownload
        }
      }
    >
      <InitializeDownload
        downloadIds={['mock-id']}
        downloadLocation="/mock/location"
        onCloseChooseLocationDialog={onCloseChooseLocationDialog}
        setDownloadIds={setDownloadIds}
      />
    </ElectronApiContext.Provider>
  )

  return {
    beginDownload,
    chooseDownloadLocation,
    deleteDownload
  }
}

describe('InitializeDownload component', () => {
  test('renders the InitializeDownload modal page', () => {
    setup()

    expect(screen.getByTestId('initialize-download-location')).toHaveTextContent('/mock/location')
  })

  test('clicking the download location sends a message to the main process', async () => {
    const user = userEvent.setup()

    const { chooseDownloadLocation } = setup()

    await user.click(screen.getByTestId('initialize-download-location'))

    expect(chooseDownloadLocation).toHaveBeenCalledTimes(1)
  })

  test('clicking the Begin Download button sends a message to the main process', async () => {
    const user = userEvent.setup()

    const { beginDownload } = setup()

    await user.click(screen.getByTestId('initialize-download-begin-download'))

    expect(beginDownload).toHaveBeenCalledTimes(1)
    expect(beginDownload).toHaveBeenCalledWith({
      downloadIds: ['mock-id'],
      downloadLocation: '/mock/location',
      makeDefaultDownloadLocation: true
    })
  })

  test('clicking the Begin Download button sends a message to the main process without setting the default', async () => {
    const user = userEvent.setup()

    const { beginDownload } = setup()

    await user.click(screen.getByText('Set this as my default download location and do not ask again next time'))
    await user.click(screen.getByTestId('initialize-download-begin-download'))

    expect(beginDownload).toHaveBeenCalledTimes(1)
    expect(beginDownload).toHaveBeenCalledWith({
      downloadIds: ['mock-id'],
      downloadLocation: '/mock/location',
      makeDefaultDownloadLocation: false
    })
  })

  test('clicking the cancel button sends a message to the main process', async () => {
    const user = userEvent.setup()

    const { deleteDownload } = setup()

    await user.click(screen.getByTestId('initialize-download-cancel-download'))

    expect(deleteDownload).toHaveBeenCalledTimes(1)
    expect(deleteDownload).toHaveBeenCalledWith({
      downloadId: 'mock-id'
    })
  })
})
