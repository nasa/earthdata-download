import React from 'react'
import { FaBan } from 'react-icons/fa'
import useAppContext from '../../hooks/useAppContext'

import Button from '../Button/Button'

import * as styles from './DownloadHistoryHeader.module.scss'

/**
 * Renders a `DownloadHeader` component
 *
 * @example <caption>Renders a `DownloadHeader` component</caption>
 * return (
 *   <DownloadHeader />
 * )
 */
const DownloadHistoryHeader = () => {
  const appContext = useAppContext()
  const {
    deleteAllToastsById
  } = appContext
  // TODO EDD-19
  // const {
  //   clearDownloadHistory
  // } = useContext(ElectronApiContext)

  const onClearDownloadHistory = () => {
    // TODO EDD-19
    // clearDownloadHistory()
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
