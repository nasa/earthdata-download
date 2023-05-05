import React from 'react'

// ipcRenderer is setup in preload.js and functions are exposed within `window.electronAPI`
// ?? Should we only call this in App.jsx and pass it down as a prop?
const { electronAPI } = window

/**
 * Renders the `Settings` page
 */
const Settings = () => {
  // Send a message to the clear the default download location
  const handleClearDefaultDownload = () => {
    electronAPI.clearDefaultDownload()
  }

  return (
    <div>
      <h1>Settings</h1>

      <button
        onClick={handleClearDefaultDownload}
        type="button"
      >
        Clear default download location
      </button>
    </div>
  )
}

export default Settings
