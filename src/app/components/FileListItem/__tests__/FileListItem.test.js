import React from 'react'
import { render } from '@testing-library/react'
import '@testing-library/jest-dom'

import FileListItem from '../FileListItem'
import DownloadItem from '../../DownloadItem/DownloadItem'

import downloadStates from '../../../constants/downloadStates'
import { ElectronApiContext } from '../../../context/ElectronApiContext'

jest.mock('../../DownloadItem/DownloadItem', () => jest.fn(() => (
  <mock-DownloadItem data-testid="DownloadItem" />
)))

const setup = (overrideProps = {}) => {
  const cancelDownloadItem = jest.fn()
  const copyDownloadPath = jest.fn()
  const openDownloadFolder = jest.fn()
  const restartDownload = jest.fn()

  const props = {
    file: {
      id: 123,
      downloadId: 'mock-download-id',
      filename: 'mock-file.png',
      state: downloadStates.active,
      percent: 42,
      createdAt: 691690191124,
      timeStart: 1691690280763,
      timeEnd: null,
      receivedBytes: 61587289,
      totalBytes: 61587289,
      remainingTime: 0
    },
    ...overrideProps
  }

  return render(
    <ElectronApiContext.Provider
      value={
        {
          cancelDownloadItem,
          copyDownloadPath,
          openDownloadFolder,
          restartDownload
        }
      }
    >
      <FileListItem {...props} />
    </ElectronApiContext.Provider>
  )
}

describe('FileListItem component', () => {
  test('renders a DownloadItem', () => {
    setup()

    expect(DownloadItem).toHaveBeenCalledTimes(1)
    expect(DownloadItem).toHaveBeenCalledWith(expect.objectContaining({
      actionsList: [
        expect.arrayContaining([
          expect.objectContaining({
            isActive: true,
            isPrimary: true,
            label: 'Cancel File',
            variant: 'danger'
          })
        ]),
        expect.arrayContaining([
          expect.objectContaining({
            isActive: false,
            isPrimary: false,
            label: 'Open File'
          }, {
            isActive: false,
            isPrimary: false,
            label: 'Copy File Path'
          }, {
            isActive: false,
            isPrimary: false,
            label: 'Restart File'
          })
        ])
      ],
      downloadId: 'mock-download-id',
      filename: 'mock-file.png',
      itemName: 'mock-file.png',
      percent: 42,
      state: downloadStates.active
      // TODO how can I verify props here
      // status: expect.objectContaining({
      //   // primary: expect.anything(),
      //   primary: expect.any(<FileListItemPercent percent={42} />)
      //   // secondary: <FileListItemTimeRemaining percent={42} remainingTime={0} shouldShowTime={false} state="ACTIVE" />,
      //   // tertiary: <FileListItemSizeProgress receivedBytes={61587289} shouldShowBytes totalBytes={61587289} />
      // })
    }), {})
  })
})
