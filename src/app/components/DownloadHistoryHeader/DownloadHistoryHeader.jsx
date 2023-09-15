import React, { useContext } from 'react'
import { FaBan, FaUndo } from 'react-icons/fa'
import useAppContext from '../../hooks/useAppContext'
import { ElectronApiContext } from '../../context/ElectronApiContext'

import Button from '../Button/Button'

import * as styles from './DownloadHistoryHeader.module.scss'
import { UNDO_TIMEOUT } from '../../constants/undoTimeout'

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
    addToast,
    deleteAllToastsById
  } = appContext

  const {
    deleteDownloadHistory,
    setPendingDeleteDownloadHistory,
    undoDeleteDownloadHistory
  } = useContext(ElectronApiContext)

  const handleClearHistory = () => {
    const now = new Date().getTime()
    const deleteId = `clear-history-${now}`

    // Clear the download
    setPendingDeleteDownloadHistory({
      deleteId
    })

    const toastId = 'undo-clear-history'

    let timeoutId

    // Setup an undo callback to provide to the toast that flips the active flag back to true
    const undoCallback = () => {
      // Undo was clicked, dismiss the setTimeout used to remove the undo toast
      clearTimeout(timeoutId)

      deleteAllToastsById(toastId)
      undoDeleteDownloadHistory({
        deleteId
      })
    }

    // Show an `undo` toast
    addToast({
      id: toastId,
      message: 'Download History Cleared',
      variant: 'spinner',
      actions: [
        {
          altText: 'Undo',
          buttonText: 'Undo',
          buttonProps: {
            Icon: FaUndo,
            onClick: undoCallback
          }
        }
      ]
    })

    // After the UNDO_TIMEOUT time has passed, remove the undo toast
    timeoutId = setTimeout(() => {
      deleteAllToastsById(toastId)

      // Actually clear the history
      deleteDownloadHistory({
        deleteId
      })
    }, UNDO_TIMEOUT)
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
        onClick={handleClearHistory}
      >
        Clear Download History
      </Button>
    </div>
  )
}

export default DownloadHistoryHeader
