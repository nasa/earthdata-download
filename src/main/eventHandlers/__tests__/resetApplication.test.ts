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
  describe('when the reset succeeds', () => {
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

  describe('when the reset fails', () => {
    test('logs an error', async () => {
      const consoleMock = jest.spyOn(console, 'log').mockImplementation(() => {})

      const database = {
        destroy: jest.fn().mockImplementation(() => {
          throw new Error('Error')
        })
      }

      await resetApplication({ database })

      expect(database.destroy).toHaveBeenCalledTimes(1)
      expect(database.destroy).toHaveBeenCalledWith()

      expect(app.getPath).toHaveBeenCalledTimes(1)
      expect(app.getPath).toHaveBeenCalledWith('userData')

      expect(shell.trashItem).toHaveBeenCalledTimes(0)
      expect(app.relaunch).toHaveBeenCalledTimes(0)
      expect(app.exit).toHaveBeenCalledTimes(0)

      expect(consoleMock).toHaveBeenCalledTimes(2)
      expect(consoleMock).toHaveBeenCalledWith('Deleting database file: /system/default/edd-database.sqlite3')
      expect(consoleMock).toHaveBeenCalledWith('Error deleting database file', new Error('Error'))
    })
  })
})
