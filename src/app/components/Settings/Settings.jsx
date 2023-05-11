import React from 'react'
import { FaBan } from 'react-icons/fa'

import Button from '../Button/Button'

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
      <p><strong>Settings</strong></p>

      <Button
        size="lg"
        Icon={FaBan}
        onClick={handleClearDefaultDownload}
      >
        Clear default download location
      </Button>
    </div>
  )
}

export default Settings
