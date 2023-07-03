import React, { useState } from 'react'
import * as RadixToast from '@radix-ui/react-toast'
import { FaWindowClose } from 'react-icons/fa'
import classNames from 'classnames'
import PropTypes from 'prop-types'
import Button from '../Button/Button'
import * as styles from './Toast.module.scss'

/**
 * @typedef {Object} ToastProps
 * @property {React.ReactNode} [action] A React node to be used as a follow-up action for the toast component.
 * @property {React.ReactNode} [children] A React node to be used as the description field of the toast component.
 * @property {String} [className] An optional css class name.
 * @property {Boolean} [closeButton] An optional boolean flag that determines the visibility of a close button for the component.
 * @property {Boolean} [open] A boolean flag that determines the initial visibility of the toast.
 * @property {String} [size] An optional string which modifies the size of the toast.
 * @property {String} [variant] An optional variant which modifies the visual appearance of the toast.
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
  action,
  children,
  className,
  closeButton,
  open,
  size,
  variant
}) => {
  const [isOpen, setIsOpen] = useState(open)

  return (
    <RadixToast.Provider>
      <RadixToast.Root
        className={
          classNames([
            styles[size],
            styles[variant],
            className
          ])
        }
        open={isOpen}
        key={className}
      >
        <RadixToast.Description>
          <div className={styles.description}>
            {
              children
            }
          </div>
        </RadixToast.Description>
        <RadixToast.Action className={styles.action} asChild altText="toast action">
          {
            action
          }
        </RadixToast.Action>
        {
          closeButton && (
            <Button
              data-testid="toast-close-button"
              onClick={() => setIsOpen(false)}
              Icon={FaWindowClose}
              variant="danger"
            />
          )
        }
      </RadixToast.Root>
      <RadixToast.Viewport className="ToastViewport" />
    </RadixToast.Provider>
  )
}

Toast.defaultProps = {
  action: null,
  children: null,
  className: null,
  closeButton: true,
  size: null,
  variant: null
}

Toast.propTypes = {
  action: PropTypes.node,
  children: PropTypes.node,
  className: PropTypes.string,
  closeButton: PropTypes.bool,
  open: PropTypes.bool.isRequired,
  size: PropTypes.string,
  variant: PropTypes.string
}

export default Toast
