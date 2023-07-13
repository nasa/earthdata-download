import React, { useContext } from 'react'
import PropTypes from 'prop-types'
import { FaSignInAlt } from 'react-icons/fa'

import Button from '../../components/Button/Button'

import { ElectronApiContext } from '../../context/ElectronApiContext'

import * as styles from './WaitingForLogin.module.scss'

/**
 * @typedef {Object} WaitingForLoginProps
 * @property {String} downloadId A string representing the id of a download.
 */

/**
 * Renders a `WaitingForLogin` dialog.
 * @param {WaitingForLoginProps} props
 *
 * @example <caption>Render a WaitingForLogin dialog.</caption>
 *
 * return (
 *   <Dialog {...dialogProps}>
 *     <WaitingForLogin
 *       downloadId={downloadId}
 *     />
 *   </Dialog>
 * )
 */
const WaitingForLogin = ({
  downloadId
}) => {
  const { sendToLogin } = useContext(ElectronApiContext)

  return (
    <>
      <div className={styles.content}>
        <p>
          Your default browser has been opened so you can log in. After logging in,
          your download should start automatically.
        </p>
        <p>
          If your browser did not open automatically, click Log In with Earthdata Login below.
        </p>
      </div>
      <div className={styles.actions}>
        <Button
          className={styles.actionsButton}
          size="lg"
          Icon={FaSignInAlt}
          onClick={() => sendToLogin({
            downloadId,
            forceLogin: true
            // TODO EDD-13, might want to be able to send a fileId as well
            // fileId
          })}
          dataTestId="waiting-for-login-log-in-with-edl"
        >
          Log In with Earthdata Login
        </Button>
      </div>
    </>
  )
}

WaitingForLogin.propTypes = {
  downloadId: PropTypes.string.isRequired
}

export default WaitingForLogin
