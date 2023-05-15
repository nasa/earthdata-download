/**
 * Keeps the current window state (size/location) update in the preferences store. So the window
 * will open in the same place as the user last had it open.
 * https://medium.com/@hql287/persisting-windows-state-in-electron-using-javascript-closure-17fc0821d37
 * @param {Object} store `electron-store` instance
 */
const windowStateKeeper = (store) => {
  let window
  let windowState

  function setBounds() {
    // Restore from store
    if (store.has('preferences.windowState')) {
      windowState = store.get('preferences.windowState')
      return
    }

    // Default
    windowState = {
      x: undefined,
      y: undefined,
      width: 800,
      height: 600
    }
  }

  function saveState() {
    if (!windowState.isMaximized) {
      windowState = window.getBounds()
    }

    windowState.isMaximized = window.isMaximized()

    store.set('preferences.windowState', windowState)
  }

  function track(win) {
    window = win;
    ['resize', 'move', 'close'].forEach((event) => {
      win.on(event, saveState)
    })
  }

  setBounds()

  return ({
    x: windowState.x,
    y: windowState.y,
    width: windowState.width,
    height: windowState.height,
    isMaximized: windowState.isMaximized,
    track
  })
}

module.exports = windowStateKeeper
