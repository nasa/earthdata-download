import React, { useContext } from 'react'
import PropTypes from 'prop-types'
import { FaSignInAlt } from 'react-icons/fa'

import Button from '../../components/Button/Button'

import { ElectronApiContext } from '../../context/ElectronApiContext'

import * as styles from './WaitingForEula.module.scss'

/**
 * @typedef {Object} WaitingForEulaProps
 * @property {String} downloadId A string representing the id of a download.
 */

/**
 * Renders a `WaitingForEula` dialog.
 * @param {WaitingForEulaProps} props
 *
 * @example <caption>Render a WaitingForEula dialog.</caption>
 *
 * return (
 *   <Dialog {...dialogProps}>
 *     <WaitingForEula
 *       downloadId={downloadId}
 *     />
 *   </Dialog>
 * )
 */
const WaitingForEula = ({
  downloadId
}) => {
  const { sendToEula } = useContext(ElectronApiContext)

  return (
    <>
      <div className={styles.content}>
        <p>
          {/* eslint-disable-next-line max-len */}
          The data provider requires acceptance of a license agreement to access the data you&apos;ve requested. Your default browser has been opened so you can accept the agreement. After accepting the agreement, your download should start automatically.
        </p>
        <p>
          If your browser did not open automatically, click View & Accept License Agreement below.
        </p>
      </div>
      <div className={styles.actions}>
        <Button
          className={styles.actionsButton}
          size="lg"
          Icon={FaSignInAlt}
          onClick={
            () => sendToEula({
              downloadId,
              forceLogin: true
            })
          }
          dataTestId="waiting-for-eula-accept-eula"
        >
          View & Accept License Agreement
        </Button>
      </div>
    </>
  )
}

WaitingForEula.defaultProps = {
  downloadId: null
}

WaitingForEula.propTypes = {
  downloadId: PropTypes.string
}

export default WaitingForEula
