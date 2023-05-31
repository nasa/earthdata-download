import windowStateKeeper from '../windowStateKeeper'

describe('windowStateKeeper', () => {
  test('returns the default window state', () => {
    const store = {
      has: jest.fn().mockReturnValue(false)
    }

    const windowState = windowStateKeeper(store)

    expect(windowState).toEqual(expect.objectContaining({
      height: 600,
      isMaximized: undefined,
      width: 800,
      x: undefined,
      y: undefined
    }))
  })

  test('returns the saved window state', () => {
    const store = {
      has: jest.fn().mockReturnValue(true),
      get: jest.fn().mockReturnValue({
        x: 0,
        y: 0,
        width: 900,
        height: 700
      })
    }

    const windowState = windowStateKeeper(store)

    expect(windowState).toEqual(expect.objectContaining({
      height: 700,
      isMaximized: undefined,
      width: 900,
      x: 0,
      y: 0
    }))
  })

  test.skip('saves the window state ', () => {
    // Skipped because I'm not sure how to test window events with my mock window object, and can't figure out how to use a real electron BrowserWindow
    const store = {
      has: jest.fn().mockReturnValue(true),
      get: jest.fn().mockReturnValue({
        x: 0,
        y: 0,
        width: 900,
        height: 700
      }),
      set: jest.fn()
    }

    const window = {
      move: jest.fn(),
      getBounds: jest.fn().mockReturnValue({
        x: 0,
        y: 0,
        width: 800,
        height: 600
      })
      // on: jest.fn()
    }

    const windowState = windowStateKeeper(store)

    // TODO how do I fire an event on my mocked window.
    // Or how do I use a real BrowserWindow, not mocked by electronMock.js?
    windowState.track(window)

    // window.on()

    expect(store.set).toHaveBeenCalledTimes(1)
  })
})
