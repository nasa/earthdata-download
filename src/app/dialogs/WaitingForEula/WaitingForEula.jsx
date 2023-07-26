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
          Your default browser has been opened so you can log in. After accepting the EULA,
          your download should start automatically.
        </p>
        <p>
          If your browser did not open automatically, click Accept EULA below.
        </p>
      </div>
      <div className={styles.actions}>
        <Button
          className={styles.actionsButton}
          size="lg"
          Icon={FaSignInAlt}
          onClick={() => sendToEula({
            downloadId,
            forceLogin: true
            // TODO EDD-13, might want to be able to send a fileId as well
            // fileId
          })}
          dataTestId="waiting-for-eula-accept-eula"
        >
          Accept EULA
        </Button>
      </div>
    </>
  )
}

WaitingForEula.propTypes = {
  downloadId: PropTypes.string.isRequired
}

export default WaitingForEula
