import React, { useContext } from 'react'
import { FaBan } from 'react-icons/fa'

import Button from '../Button/Button'
import { ElectronApiContext } from '../../context/ElectronApiContext'

/**
 * Renders the `Settings` page
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
      >
        Clear default download location
      </Button>
    </div>
  )
}

export default Settings
