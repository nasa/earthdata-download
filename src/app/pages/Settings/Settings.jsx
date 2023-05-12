import React, { useContext } from 'react'
import { FaBan } from 'react-icons/fa'

import Button from '../../components/Button/Button'

import { ElectronApiContext } from '../../context/ElectronApiContext'

/**
 * Renders a `Settings` page.
 *
 * @example <caption>Render a Settings page.</caption>
 *
 * return (
 *   <Settings />
 * )
 */
const Settings = () => {
  const { clearDefaultDownload } = useContext(ElectronApiContext)

  // Send a message to the clear the default download location
  const handleClearDefaultDownload = () => {
    clearDefaultDownload()
  }

  return (
    <div>
      <p><strong>Settings</strong></p>

      <Button
        size="lg"
        Icon={FaBan}
        onClick={handleClearDefaultDownload}
        dataTestId="settings-clear-default-download"
      >
        Clear default download location
      </Button>
    </div>
  )
}

export default Settings
