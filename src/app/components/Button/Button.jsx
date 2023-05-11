import React from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'

import * as styles from './Button.module.scss'

const Button = ({
  className,
  children,
  href,
  Icon,
  onClick,
  rel,
  size,
  target,
  variant
}) => {
  const TagName = !href ? 'button' : 'a'
  const conditionalProps = {}

  if (href) conditionalProps.href = href
  if (onClick) conditionalProps.onClick = onClick

  return (
    <TagName
      className={
        classNames([
          styles.button,
          styles[size],
          styles[variant],
          className
        ])
      }
      type="button"
      target={target}
      rel={rel}
      {...conditionalProps}
    >
      {Icon && <Icon className={styles.icon} />}
      {children}
    </TagName>
  )
}

Button.defaultProps = {
  className: null,
  href: null,
  Icon: null,
  onClick: null,
  rel: null,
  size: 'sm',
  target: null,
  variant: null
}

Button.propTypes = {
  className: PropTypes.string,
  children: PropTypes.oneOfType([
    PropTypes.func,
    PropTypes.string
  ]).isRequired,
  href: PropTypes.string,
  Icon: PropTypes.func,
  onClick: PropTypes.func,
  rel: PropTypes.string,
  size: PropTypes.string,
  target: PropTypes.string,
  variant: PropTypes.string
}

export default Button
