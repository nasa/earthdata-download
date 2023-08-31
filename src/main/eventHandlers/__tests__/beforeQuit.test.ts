// @ts-nocheck

import { dialog } from 'electron'

import beforeQuit from '../beforeQuit'

describe('beforeQuit', () => {
  test('returns false if no downloads are running', async () => {
    const currentDownloadItems = {
      getNumberOfDownloads: jest.fn().mockReturnValue(0)
    }

    const result = await beforeQuit({ currentDownloadItems })

    expect(result).toEqual(false)
  })

  test('returns false if Quit was selected', async () => {
    dialog.showMessageBoxSync = jest.fn().mockReturnValue(0)
    const currentDownloadItems = {
      getNumberOfDownloads: jest.fn().mockReturnValue(1)
    }

    const result = await beforeQuit({ currentDownloadItems })

    expect(result).toEqual(false)
  })

  test('returns true if cancelled was selected', async () => {
    dialog.showMessageBoxSync = jest.fn().mockReturnValue(1)
    const currentDownloadItems = {
      getNumberOfDownloads: jest.fn().mockReturnValue(1)
    }

    const result = await beforeQuit({ currentDownloadItems })

    expect(result).toEqual(true)
  })
})
