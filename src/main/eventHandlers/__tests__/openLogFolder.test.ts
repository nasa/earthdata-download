import { shell } from 'electron'
import openLogFolder from '../openLogFolder'

jest.mock('electronShell', () => ({
  app: {
    getPath: jest.fn().mockReturnValue('/system/default')
  },
  shell: {
    openPath: jest.fn()
  }
}))

describe('openLogFolder', () => {
  test('opens the logs folder using shell.openPath', async () => {
    await openLogFolder()

    expect(shell.openPath).toHaveBeenCalledWith('/system/default')
  })
})
