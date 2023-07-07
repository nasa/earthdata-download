import React from 'react'
import PropTypes from 'prop-types'
import * as styles from './Input.module.scss'

/**
 * @typedef {Object} InputProps
 * @property {String} type the element input type e.g. numerical, text
 * @property {String} placeholder An optional placeholder value for the input field
 * @property {Function} onChange A function to be called when change to the input is made
 * @property {Function} onBlur A function to be called when focus on the input is lost
 * @property {String} value The value the input currently displays

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
  id,
  label,
  onChange,
  onBlur,
  placeholder,
  type,
  value
}) => (
  <input
    id={id}
    name={id}
    aria-label={label}
    className={styles.input}
    value={value}
    type={type}
    placeholder={placeholder}
    onChange={onChange}
    onBlur={onBlur}
  />
)

Input.defaultProps = {
  placeholder: null
}

Input.propTypes = {
  id: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  onBlur: PropTypes.func.isRequired,
  placeholder: PropTypes.number,
  type: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired
}

export default Input
