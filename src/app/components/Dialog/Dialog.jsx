import React, { forwardRef } from 'react'
import PropTypes from 'prop-types'
import { FaTimes } from 'react-icons/fa'
import { VisuallyHidden } from '@radix-ui/react-visually-hidden'
import * as RadixDialog from '@radix-ui/react-dialog'
import classNames from 'classnames'

import * as styles from './Dialog.module.scss'
import Button from '../Button/Button'
import Tooltip from '../Tooltip/Tooltip'

/**
 * @typedef {Object} DialogProps
 * @property {React.ReactNode} children A React node to be used as the children of the main modal component.
 * @property {Boolean} [closeButton] An optional boolean flag which triggers the display of the close button.
 * @property {String} [description] An optional string to be used as the description for the dialog window.
 * @property {Boolean} open A boolean flag that determines the visibility of the dialog.
 * @property {Function} setOpen A function to set the open prop when the modal is closed.
 * @property {Boolean} [showTitle] An optional boolean flag that determines the visibility of the dialog title.
 * @property {String} [size] An optional string designating a size (ex: "lg").
 * @property {String} title A string to be used as the title for the dialog window.
 * @property {Function} [TitleIcon] An optional react-icons icon.
 */

/**
 * Renders a `Dialog` component.
 * @param {DialogProps} props
 *
 * @example <caption>Render a dialog.</caption>
 *
 * const [open, setOpen] = useState(false)
 *
 * return (
 *   <Dialog
 *      closeButton
 *      description="This is a little more context about the dialog."
 *      open={open}
 *      setOpen={setOpen}
 *      title="I am a dialog"
 *   >
 *      <p>I am a dialog!</p>
 *   </Dialog>
 * )
 */
const Dialog = ({
  children,
  closeButton,
  description,
  open,
  setOpen,
  showTitle,
  size,
  title,
  TitleIcon
}) => {
  const headerClassNames = classNames([
    styles.header,
    {
      [styles.hasIcon]: TitleIcon
    }
  ])

  const contentClassNames = classNames([
    styles.content,
    {
      [styles.isLg]: size === 'lg'
    }
  ])

  return (
    <RadixDialog.Root open={open} onOpenChange={setOpen}>
      <RadixDialog.Portal>
        <RadixDialog.Overlay className={styles.overlay} />
        <div className={styles.contentWrapper}>
          <RadixDialog.Content className={contentClassNames}>
            <header className={headerClassNames}>
              {
                showTitle
                  ? (
                    <>
                      {TitleIcon && <TitleIcon className={styles.titleIcon} />}
                      <RadixDialog.Title className={styles.title}>{title}</RadixDialog.Title>
                    </>
                  )
                  : (
                    <VisuallyHidden asChild>
                      <RadixDialog.Title className={styles.title}>{title}</RadixDialog.Title>
                    </VisuallyHidden>
                  )
                }
              {
                description && (
                  <RadixDialog.Description className={styles.description}>
                    {description}
                  </RadixDialog.Description>
                )
              }
            </header>
            <section className={styles.innerContent}>
              {children}
            </section>
            {
              closeButton && (
                <RadixDialog.Close asChild>
                  <Button
                    className={styles.closeButton}
                    hideLabel
                    Icon={FaTimes}
                  >
                    Close
                  </Button>
                </RadixDialog.Close>
              )
            }
          </RadixDialog.Content>
        </div>
      </RadixDialog.Portal>
    </RadixDialog.Root>
  )
}

Dialog.defaultProps = {
  children: null,
  closeButton: false,
  description: null,
  open: false,
  primaryAction: {
    className: null,
    title: null
  },
  setOpen: null,
  showTitle: false,
  size: null,
  title: null,
  TitleIcon: null
}

Dialog.propTypes = {
  children: PropTypes.node,
  closeButton: PropTypes.bool,
  description: PropTypes.string,
  open: PropTypes.bool,
  primaryAction: PropTypes.shape({
    className: PropTypes.string,
    title: PropTypes.string
  }),
  setOpen: PropTypes.func,
  showTitle: PropTypes.bool,
  size: PropTypes.string,
  title: PropTypes.string,
  TitleIcon: PropTypes.func
}

export default Dialog
