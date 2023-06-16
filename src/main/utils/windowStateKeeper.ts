// @ts-nocheck

/**
 * Keeps the current window state (size/location) update in the database. So the window
 * will open in the same place as the user last had it open.
 * https://medium.com/@hql287/persisting-windows-state-in-electron-using-javascript-closure-17fc0821d37
 * @param {Object} database `EddDatabase` instance
 */
const windowStateKeeper = async (database) => {
  let appWindow
  let windowState

  async function setBounds() {
    // Restore from database
    const preferences = await database.getPreferences()
    const { windowState: windowStateString } = preferences

    if (windowStateString) {
      windowState = JSON.parse(windowStateString)
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
      windowState = appWindow.getBounds()
    }

    windowState.isMaximized = appWindow.isMaximized()

    database.setPreferences({ windowState: JSON.stringify(windowState) })
  }

  function track(trackedWindow) {
    appWindow = trackedWindow;

    ['resize', 'move', 'close'].forEach((event) => {
      trackedWindow.on(event, saveState)
    })
  }

  await setBounds()

  return ({
    x: windowState.x,
    y: windowState.y,
    width: windowState.width,
    height: windowState.height,
    isMaximized: windowState.isMaximized,
    track
  })
}

export default windowStateKeeper
