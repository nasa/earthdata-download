import React from 'react'
import PropTypes from 'prop-types'
import { FaTimes } from 'react-icons/fa'
import { VisuallyHidden } from '@radix-ui/react-visually-hidden'
import * as RadixDialog from '@radix-ui/react-dialog'

import * as styles from './Dialog.module.scss'
import Button from '../Button/Button'

const Dialog = ({
  children,
  closeButton,
  description,
  open,
  setOpen,
  showTitle,
  title,
  TitleIcon
}) => (
  <RadixDialog.Root open={open} onOpenChange={setOpen}>
    <RadixDialog.Portal>
      <RadixDialog.Overlay className={styles.overlay} />
      <div className={styles.contentWrapper}>
        <RadixDialog.Content className={styles.content}>
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
          {children}
        </RadixDialog.Content>
        {
          closeButton && (
            <Dialog.Close asChild>
              <Button
                className="IconButton"
                aria-label="Close"
                Icon={FaTimes}
              >
                Close
              </Button>
            </Dialog.Close>
          )
        }
      </div>
    </RadixDialog.Portal>
  </RadixDialog.Root>
)

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
  title: PropTypes.string,
  TitleIcon: PropTypes.func
}

export default Dialog
