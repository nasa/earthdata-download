import { app, shell } from 'electron'
import resetApplication from '../resetApplication'

jest.mock('electronShell', () => ({
  app: {
    getPath: jest.fn().mockReturnValue('/system/default'),
    relaunch: jest.fn(),
    exit: jest.fn()
  },
  shell: {
    trashItem: jest.fn()
  }
}))

describe('resetApplication', () => {
  test('deletes the database and relaunches the application', async () => {
    const database = {
      destroy: jest.fn()
    }

    await resetApplication({ database })

    expect(database.destroy).toHaveBeenCalledTimes(1)
    expect(database.destroy).toHaveBeenCalledWith()

    expect(app.getPath).toHaveBeenCalledTimes(1)
    expect(app.getPath).toHaveBeenCalledWith('userData')

    expect(shell.trashItem).toHaveBeenCalledTimes(1)
    expect(shell.trashItem).toHaveBeenCalledWith('/system/default/edd-database.sqlite3')

    expect(app.relaunch).toHaveBeenCalledTimes(1)
    expect(app.relaunch).toHaveBeenCalledWith()

    expect(app.exit).toHaveBeenCalledTimes(1)
    expect(app.exit).toHaveBeenCalledWith(0)
  })
})
