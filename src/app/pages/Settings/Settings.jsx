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
  const {
    clearDefaultDownload,
    deleteCookies
  } = useContext(ElectronApiContext)

  // Send a message to the clear the default download location
  const onClearDefaultDownload = () => {
    clearDefaultDownload()
  }
  const onDeleteCookies = () => {
    deleteCookies()
  }

  return (
    <div>
      <p><strong>Settings</strong></p>

      <Button
        size="lg"
        Icon={FaBan}
        onClick={onClearDefaultDownload}
        dataTestId="settings-clear-default-download"
      >
        Clear default download location
      </Button>

      <Button
        size="lg"
        Icon={FaBan}
        onClick={onDeleteCookies}
        dataTestId="settings-delete-cookies"
      >
        Delete cookies
      </Button>
    </div>
  )
}

export default Settings
