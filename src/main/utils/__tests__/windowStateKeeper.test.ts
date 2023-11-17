// @ts-nocheck

import metricsLogger from '../metricsLogger'
import windowStateKeeper from '../windowStateKeeper'

jest.mock('../../utils/metricsLogger.ts', () => ({
  __esModule: true,
  default: jest.fn(() => {})
}))

describe('windowStateKeeper', () => {
  test('returns the default window state', async () => {
    const database = {
      getPreferences: jest.fn().mockReturnValue('{}')
    }

    const windowState = await windowStateKeeper(database)

    expect(windowState).toEqual(expect.objectContaining({
      height: 600,
      isMaximized: undefined,
      width: 800,
      x: undefined,
      y: undefined
    }))

    expect(metricsLogger).toHaveBeenCalledTimes(1)
    expect(metricsLogger).toHaveBeenCalledWith({
      eventType: 'WindowSizePreferences',
      data: {
        windowStateInfo: {
          height: 600,
          width: 800,
          x: undefined,
          y: undefined,
          isMaximized: undefined
        }
      }
    })
  })

  test('returns the saved window state', async () => {
    const database = {
      getPreferences: jest.fn().mockReturnValue({
        windowState: JSON.stringify({
          x: 0,
          y: 0,
          width: 900,
          height: 700
        })
      })
    }

    const windowState = await windowStateKeeper(database)

    expect(windowState).toEqual(expect.objectContaining({
      height: 700,
      isMaximized: undefined,
      width: 900,
      x: 0,
      y: 0
    }))

    expect(metricsLogger).toHaveBeenCalledTimes(1)
    expect(metricsLogger).toHaveBeenCalledWith({
      eventType: 'WindowSizePreferences',
      data: {
        windowStateInfo: {
          height: 700,
          width: 900,
          x: 0,
          y: 0,
          isMaximized: undefined
        }
      }
    })
  })

  describe('when tracking the window state changes', () => {
    describe('when resizing', () => {
      test('saves the maximized window state ', async () => {
        const database = {
          getPreferences: jest.fn().mockReturnValue({
            windowState: JSON.stringify({
              x: 0,
              y: 0,
              width: 900,
              height: 700,
              isMaximized: true
            })
          }),
          setPreferences: jest.fn()
        }

        const channels = {}
        const window = {
          move: jest.fn(),
          getBounds: jest.fn().mockReturnValue({
            x: 0,
            y: 0,
            width: 800,
            height: 600
          }),
          isMaximized: jest.fn().mockReturnValue(true),
          on: (channel, callback) => {
            channels[channel] = callback
          },
          send: (channel, event) => {
            channels[channel](event)
          }
        }

        const windowState = await windowStateKeeper(database)

        windowState.track(window)

        window.send('resize')

        expect(database.setPreferences).toHaveBeenCalledTimes(1)
        expect(database.setPreferences).toHaveBeenCalledWith({
          windowState: '{"x":0,"y":0,"width":900,"height":700,"isMaximized":true}'
        })
      })

      test('saves the non-maximized window state ', async () => {
        const database = {
          getPreferences: jest.fn().mockReturnValue({
            windowState: JSON.stringify({
              x: 0,
              y: 0,
              width: 900,
              height: 700,
              isMaximized: false
            })
          }),
          setPreferences: jest.fn()
        }

        const channels = {}
        const window = {
          move: jest.fn(),
          getBounds: jest.fn().mockReturnValue({
            x: 0,
            y: 0,
            width: 800,
            height: 600
          }),
          isMaximized: jest.fn().mockReturnValue(false),
          on: (channel, callback) => {
            channels[channel] = callback
          },
          send: (channel, event) => {
            channels[channel](event)
          }
        }

        const windowState = await windowStateKeeper(database)

        windowState.track(window)

        window.send('resize')

        expect(database.setPreferences).toHaveBeenCalledTimes(1)
        expect(database.setPreferences).toHaveBeenCalledWith({
          windowState: '{"x":0,"y":0,"width":800,"height":600,"isMaximized":false}'
        })
      })
    })

    describe('when moving', () => {
      test('saves the maximized window state ', async () => {
        const database = {
          getPreferences: jest.fn().mockReturnValue({
            windowState: JSON.stringify({
              x: 0,
              y: 0,
              width: 900,
              height: 700,
              isMaximized: true
            })
          }),
          setPreferences: jest.fn()
        }

        const channels = {}
        const window = {
          move: jest.fn(),
          getBounds: jest.fn().mockReturnValue({
            x: 0,
            y: 0,
            width: 800,
            height: 600
          }),
          isMaximized: jest.fn().mockReturnValue(true),
          on: (channel, callback) => {
            channels[channel] = callback
          },
          send: (channel, event) => {
            channels[channel](event)
          }
        }

        const windowState = await windowStateKeeper(database)

        windowState.track(window)

        window.send('move')

        expect(database.setPreferences).toHaveBeenCalledTimes(1)
        expect(database.setPreferences).toHaveBeenCalledWith({
          windowState: '{"x":0,"y":0,"width":900,"height":700,"isMaximized":true}'
        })
      })

      test('saves the non-maximized window state ', async () => {
        const database = {
          getPreferences: jest.fn().mockReturnValue({
            windowState: JSON.stringify({
              x: 0,
              y: 0,
              width: 900,
              height: 700,
              isMaximized: false
            })
          }),
          setPreferences: jest.fn()
        }

        const channels = {}
        const window = {
          move: jest.fn(),
          getBounds: jest.fn().mockReturnValue({
            x: 0,
            y: 0,
            width: 800,
            height: 600
          }),
          isMaximized: jest.fn().mockReturnValue(false),
          on: (channel, callback) => {
            channels[channel] = callback
          },
          send: (channel, event) => {
            channels[channel](event)
          }
        }

        const windowState = await windowStateKeeper(database)

        windowState.track(window)

        window.send('move')

        expect(database.setPreferences).toHaveBeenCalledTimes(1)
        expect(database.setPreferences).toHaveBeenCalledWith({
          windowState: '{"x":0,"y":0,"width":800,"height":600,"isMaximized":false}'
        })
      })
    })

    describe('when closing', () => {
      test('saves the maximized window state ', async () => {
        const database = {
          getPreferences: jest.fn().mockReturnValue({
            windowState: JSON.stringify({
              x: 0,
              y: 0,
              width: 900,
              height: 700,
              isMaximized: true
            })
          }),
          setPreferences: jest.fn()
        }

        const channels = {}
        const window = {
          move: jest.fn(),
          getBounds: jest.fn().mockReturnValue({
            x: 0,
            y: 0,
            width: 800,
            height: 600
          }),
          isMaximized: jest.fn().mockReturnValue(true),
          on: (channel, callback) => {
            channels[channel] = callback
          },
          send: (channel, event) => {
            channels[channel](event)
          }
        }

        const windowState = await windowStateKeeper(database)

        windowState.track(window)

        window.send('close')

        expect(database.setPreferences).toHaveBeenCalledTimes(1)
        expect(database.setPreferences).toHaveBeenCalledWith({
          windowState: '{"x":0,"y":0,"width":900,"height":700,"isMaximized":true}'
        })
      })

      test('saves the non-maximized window state ', async () => {
        const database = {
          getPreferences: jest.fn().mockReturnValue({
            windowState: JSON.stringify({
              x: 0,
              y: 0,
              width: 900,
              height: 700,
              isMaximized: false
            })
          }),
          setPreferences: jest.fn()
        }

        const channels = {}
        const window = {
          move: jest.fn(),
          getBounds: jest.fn().mockReturnValue({
            x: 0,
            y: 0,
            width: 800,
            height: 600
          }),
          isMaximized: jest.fn().mockReturnValue(false),
          on: (channel, callback) => {
            channels[channel] = callback
          },
          send: (channel, event) => {
            channels[channel](event)
          }
        }

        const windowState = await windowStateKeeper(database)

        windowState.track(window)

        window.send('close')

        expect(database.setPreferences).toHaveBeenCalledTimes(1)
        expect(database.setPreferences).toHaveBeenCalledWith({
          windowState: '{"x":0,"y":0,"width":800,"height":600,"isMaximized":false}'
        })
      })
    })
  })
})
