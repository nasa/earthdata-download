import React, { forwardRef } from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import * as VisuallyHidden from '@radix-ui/react-visually-hidden'

import Tooltip from '../Tooltip/Tooltip'

import * as styles from './Button.module.scss'

/**
 * @typedef {Object} ButtonProps
 * @property {String} [className] An optional css class name.
 * @property {React.ReactNode} [children] An optional React node.
 * @property {Boolean} [disabled] An optional flag to set `disabled` attribute on the button.
 * @property {Boolean} [hideLabel] An optional flag to set `hideLabel` attribute on the button.
 * @property {String} [href] An optional url. If passed, the button will be rendered as an <a> element.
 * @property {Function} [Icon] An optional react-icons icon.
 * @property {Function} [onClick] An optional callback function to be called when the button is clicked.
 * @property {String} [rel] An optional string to be used as the `rel` attribute on a link. If passed, the button will be rendered as an <a> element.
 * @property {String} [size] An optional string which modifies the size of the button.
 * @property {String} [target] An optional string to be used as the `target` attribute on a link.
 * @property {String} [variant] An optional variant which modifies the visual appearance of the button.
 * @property {...*} [rest] Any additional props will be spread as props onto the root element, which is important for allowing tooltips and other enhancements.
 */

/**
 * Renders a `Button` component.
 * @param {ButtonProps} props
 *
 * @example <caption>Render the button as a `button` element.</caption>
 *
 * return (
 *   <Button
 *      className="button-example"
 *      onClick={() => console.log("Hello World!")}
 *      variant="success"
 *      size="large"
 *   >
 *      Click Me
 *   </Button>
 * )
 *
 * @example <caption>Render the button as an `a` element.</caption>
 * return (
 *   <Button
 *      className="button-example"
 *      variant="success"
 *      size="large"
 *      href="https://search.earthdata.nasa.gov/"
 *      target="_blank"
 *      rel="noreferrer"
 *   >
 *      Click Me
 *   </Button>
 * )
 */
const Button = forwardRef(({
  className,
  children,
  dataTestId,
  disabled,
  hideLabel,
  hideTooltip,
  href,
  Icon,
  onClick,
  rel,
  size,
  target,
  tooltipDelayDuration,
  variant,
  ...rest
}, ref) => {
  // If a href is passed, an <a> is used for the base element, otherwise a <button> is used
  const TagName = !href ? 'button' : 'a'

  // Create an object of conditional props to be spread onto the button
  const conditionalProps = {}

  if (href) conditionalProps.href = href
  if (onClick) conditionalProps.onClick = onClick
  if (rel) conditionalProps.rel = rel
  if (target) conditionalProps.target = target

  if (!href) conditionalProps.type = 'button'

  const button = (
    <TagName
      ref={ref}
      className={
        classNames([
          styles.button,
          styles[size],
          styles[variant],
          { [styles.hasLabel]: !hideLabel },
          className
        ])
      }
      data-testid={dataTestId}
      disabled={disabled}
      type="button"
      {...conditionalProps}
      {...rest}
    >
      <>
        {Icon && <Icon className={styles.icon} />}
        {
          hideLabel
            ? (
              <VisuallyHidden.Root>
                {children}
              </VisuallyHidden.Root>
            )
            : children
        }
      </>
    </TagName>
  )

  if (hideLabel && !hideTooltip) {
    return (
      <Tooltip
        content={children}
        delayDuration={tooltipDelayDuration}
      >
        {button}
      </Tooltip>
    )
  }

  return button
})

Button.displayName = 'Button'

Button.defaultProps = {
  children: null,
  className: null,
  dataTestId: null,
  disabled: false,
  hideLabel: false,
  hideTooltip: false,
  href: null,
  Icon: null,
  onClick: null,
  rel: null,
  size: 'sm',
  target: null,
  tooltipDelayDuration: 0,
  variant: null
}

Button.propTypes = {
  className: PropTypes.string,
  children: PropTypes.oneOfType([
    PropTypes.func,
    PropTypes.string,
    PropTypes.node
  ]),
  dataTestId: PropTypes.string,
  disabled: PropTypes.bool,
  hideLabel: PropTypes.bool,
  hideTooltip: PropTypes.bool,
  href: PropTypes.string,
  Icon: PropTypes.func,
  onClick: PropTypes.func,
  rel: PropTypes.string,
  size: PropTypes.string,
  target: PropTypes.string,
  tooltipDelayDuration: PropTypes.number,
  variant: PropTypes.string
}

export default Button
