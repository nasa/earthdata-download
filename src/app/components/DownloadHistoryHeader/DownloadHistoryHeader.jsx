import React, { useContext } from 'react'
import { FaBan } from 'react-icons/fa'
import useAppContext from '../../hooks/useAppContext'
import { ElectronApiContext } from '../../context/ElectronApiContext'

import Button from '../Button/Button'

import * as styles from './DownloadHistoryHeader.module.scss'

/**
 * Renders a `DownloadHistoryHeader` component
 *
 * @example <caption>Renders a `DownloadHistoryHeader` component</caption>
 * return (
 *   <DownloadHistoryHeader />
 * )
 */
const DownloadHistoryHeader = () => {
  const appContext = useAppContext()
  const {
    deleteAllToastsById
  } = appContext

  const {
    clearDownloadHistory
  } = useContext(ElectronApiContext)

  const onClearDownloadHistory = () => {
    clearDownloadHistory({})
    deleteAllToastsById()
  }

  return (
    <div
      className={styles.listHeader}
    >
      <Button
        className={styles.headerButton}
        size="sm"
        Icon={FaBan}
        variant="danger"
        onClick={onClearDownloadHistory}
      >
        Clear Download History
      </Button>
    </div>
  )
}

export default DownloadHistoryHeader
