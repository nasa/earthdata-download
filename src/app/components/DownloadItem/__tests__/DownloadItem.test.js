import React from 'react'
import { render, fireEvent } from '@testing-library/react'
import DownloadItem from '../DownloadItem'

describe('DownloadItem', () => {
  const mockProps = {
    downloadId: 'shortName_version-2-20230518_144046',
    downloadName: 'shortName_version-2-20230518_144046',
    progress: {
      percent: 75,
      finishedFiles: 2,
      totalFiles: 6,
      totalTime: 45
    },
    state: 'ACTIVE',
    onCancelDownload: jest.fn(),
    onPauseDownload: jest.fn(),
    onOpenDownloadFolder: jest.fn(),
    onCopyDownloadPath: jest.fn(),
    onResumeDownload: jest.fn()
  }

  test('calls onResumeDownload when resume button is clicked', () => {
    const { getByText } = render(<DownloadItem {...mockProps} state="PAUSED" />)
    const resumeButton = getByText('Resume')

    fireEvent.click(resumeButton)

    expect(mockProps.onResumeDownload).toHaveBeenCalledTimes(1)
    expect(mockProps.onResumeDownload).toHaveBeenCalledWith('shortName_version-2-20230518_144046', 'shortName_version-2-20230518_144046')
  })

  test('calls onCancelDownload when cancel button is clicked', () => {
    const { getByText } = render(<DownloadItem {...mockProps} />)
    const cancelButton = getByText('Cancel')

    fireEvent.click(cancelButton)

    expect(mockProps.onCancelDownload).toHaveBeenCalledTimes(1)
    expect(mockProps.onCancelDownload).toHaveBeenCalledWith('shortName_version-2-20230518_144046', 'shortName_version-2-20230518_144046')
  })

  test('calls onPauseDownload when pause button is clicked', () => {
    const { getByText } = render(<DownloadItem {...mockProps} />)
    const pauseButton = getByText('Pause')

    fireEvent.click(pauseButton)

    expect(mockProps.onPauseDownload).toHaveBeenCalledTimes(1)
    expect(mockProps.onPauseDownload).toHaveBeenCalledWith('shortName_version-2-20230518_144046', 'shortName_version-2-20230518_144046')
  })

  test('calls onOpenDownloadFolder when open folder button is clicked', () => {
    const { getByText } = render(<DownloadItem {...mockProps} state="COMPLETED" />)
    const openFolderButton = getByText('Open Folder')

    fireEvent.click(openFolderButton)

    expect(mockProps.onOpenDownloadFolder).toHaveBeenCalledTimes(1)
    expect(mockProps.onOpenDownloadFolder).toHaveBeenCalledWith('shortName_version-2-20230518_144046')
  })

  test('calls onCopyDownloadPath when copy path button is clicked', () => {
    const { getByText } = render(<DownloadItem {...mockProps} state="COMPLETED" />)
    const copyPathButton = getByText('Copy Path')

    fireEvent.click(copyPathButton)

    expect(mockProps.onCopyDownloadPath).toHaveBeenCalledTimes(1)
    expect(mockProps.onCopyDownloadPath).toHaveBeenCalledWith('shortName_version-2-20230518_144046')
  })
})
