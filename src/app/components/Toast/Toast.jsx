import React from 'react'
import PropTypes from 'prop-types'
import * as RadixToast from '@radix-ui/react-toast'
import classNames from 'classnames'
import {
  FaCheckCircle,
  FaExclamationCircle,
  FaInfoCircle,
  FaSpinner,
  FaTimes
} from 'react-icons/fa'

import Button from '../Button/Button'

import createVariantClassName from '../../utils/createVariantClassName'

import * as styles from './Toast.module.scss'

/**
 * @typedef {Object} ToastAction
 * @property {String} altText The alt text for assistive technologies.
 * @property {Object} buttonProps An object used to configure the action button.
 * @property {String} buttonText The label for the action.
*/

/**
 * @typedef {Object} ToastProps
 * @property {[ToastAction]} [actions] A list of objects used to configure additional actions.
 * @property {Function} dismissToast A callback function used to dismiss the toast.
 * @property {String} id An ID to be used by the toast.
 * @property {String} message A string used as the message for the toast.
 * @property {String} [title] A string used as the title for the toast.
 * @property {String} [variant] A string used as the variant for the toast.
*/

/**
 * Renders a `Toast` component
 * @param {ToastProps} props
 *
 * @example <caption>Render a Toast component.</caption>
 *
 * return (
 *  <Toast
 *    action={action}
 *    className={className}
 *    closeButton
 *    open
 *    size="large"
 *    variant="foreground"
 *  >
 *    I'm a toast
 *  </Toast>
 * )
 */
const Toast = ({
  actions,
  dismissToast,
  id,
  message,
  title,
  variant
}) => (
  <RadixToast.Root
    className={
      classNames([
        styles.toast,
        styles[createVariantClassName(variant)]
      ])
    }
    open
  >
    <div className={styles.primary}>
      {
        !variant && (
          <FaInfoCircle className={styles.icon} />
        )
      }
      {
        variant === 'danger' && (
          <FaExclamationCircle className={styles.icon} />
        )
      }
      {
        variant === 'spinner' && (
          <FaSpinner
            className={
              classNames([
                styles.icon,
                styles.spinner
              ])
            }
          />
        )
      }
      {
        variant === 'success' && (
          <FaCheckCircle className={styles.icon} />
        )
      }
      <div>
        {
          title && (
            <h3 className={styles.title}>
              {title}
            </h3>
          )
        }
        <p className={styles.message}>
          {message}
        </p>
      </div>
    </div>
    <div className={styles.secondary}>
      {
        actions && actions.map(({
          altText,
          buttonProps,
          buttonText
        }) => (
          <RadixToast.Action
            key={`${id}_action-${buttonText}`}
            asChild
            altText={altText}
          >
            <Button className={styles.action} {...buttonProps} size="lg">
              {buttonText}
            </Button>
          </RadixToast.Action>
        ))
      }
      <RadixToast.Action asChild altText="Dismiss">
        <Button
          className={styles.action}
          data-testid="toast-close-button"
          onClick={() => dismissToast(id)}
          Icon={FaTimes}
          size="lg"
          hideLabel
        >
          Dismiss
        </Button>
      </RadixToast.Action>
    </div>
  </RadixToast.Root>
)

Toast.defaultProps = {
  actions: [],
  title: null,
  variant: null
}

Toast.propTypes = {
  actions: PropTypes.arrayOf(
    PropTypes.shape({
      altText: PropTypes.string.isRequired,
      buttonProps: PropTypes.shape({
        onClick: PropTypes.func.isRequired,
        variant: PropTypes.string,
        hideLabel: PropTypes.bool
      }).isRequired,
      buttonText: PropTypes.string.isRequired
    })
  ),
  dismissToast: PropTypes.func.isRequired,
  id: PropTypes.string.isRequired,
  message: PropTypes.string.isRequired,
  title: PropTypes.string,
  variant: PropTypes.string
}

export default Toast
