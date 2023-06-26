import React from 'react'
import PropTypes from 'prop-types'
import * as RadixLabel from '@radix-ui/react-label'
import * as styles from './Input.module.scss'

/**
 * @typedef {Object} InputProps
 * @property {String} type the element input type e.g. numerical, text
 * @property {String} placeholder An optional placeholder value for the input field
 * @property {Function} onChange A function to be called when change to the input is made
 * @property {Function} onBlur A function to be called when focus on the input is lost
 * @property {String} value The value the input currently displays
 * @property {String} label The text for the label of the input field

/**
 * Renders a `Input` component
 * @param {InputProps} props
 *
 * @example <caption>Renders an `Input` component.</caption>
 *
 * return (
 *   <Input
 *     type="text"
 *     placeholder="place-holder value"
 *     onChange={() => console.log("Input field value changed")}
 *     onBlur={() => console.log("Element focus lost")}
 *     value="input-value"
 *   />
 * )
 */

const Input = ({
  type,
  placeholder,
  onChange,
  onBlur,
  value,
  label
}) => (
  <div className={styles.div}>
    <RadixLabel.Root className={styles.labelRoot}>
      {label}
      {' '}
    </RadixLabel.Root>
    <input
      data-testid="input-test-id"
      className={styles.input}
      value={value}
      type={type}
      placeholder={placeholder}
      onChange={onChange}
      onBlur={onBlur}
    />
  </div>
)

Input.defaultProps = {
  placeholder: null,
  label: null
}

Input.propTypes = {
  type: PropTypes.string.isRequired,
  placeholder: PropTypes.number,
  onChange: PropTypes.func.isRequired,
  onBlur: PropTypes.func.isRequired,
  value: PropTypes.string.isRequired,
  label: PropTypes.string
}

export default Input
