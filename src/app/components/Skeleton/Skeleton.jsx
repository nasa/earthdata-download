import React from 'react'
import PropTypes from 'prop-types'
import {
  uniqueId,
  mapValues,
  isString,
  isNumber
} from 'lodash'

import * as styles from './Skeleton.module.scss'

const normalizeSizeValues = (obj) => mapValues(obj, (value) => {
  if (isNumber(value)) return `${value / 16}rem`
  if (isString(value) && value.indexOf('px') > -1) return `${parseInt(value, 10) / 16}rem`

  return value
})

/**
 * Renders loading placeholder.
 * @param {object} props.containerStyle - CSS in JS style object to apply additional styles.
 * @param {array} props.shapes - An array of objects defining the individual skeleton shapes.
 */
export const Skeleton = ({
  containerStyle,
  shapes
}) => {
  const shapeElements = shapes.map((shape) => {
    let item = null
    const key = uniqueId('skeleton_key_')
    const normalizedStyles = normalizeSizeValues(shape)

    if (normalizedStyles.shape === 'rectangle') {
      item = (
        <div
          key={key}
          className={styles.skeletonItem}
          style={
            {
              top: normalizedStyles.top,
              left: normalizedStyles.left,
              right: normalizedStyles.right,
              width: normalizedStyles.width,
              height: normalizedStyles.height,
              borderRadius: normalizedStyles.radius
            }
          }
        >
          <span className={styles.skeletonItemInner} />
        </div>
      )
    }

    return item
  })

  const normalizedStyles = normalizeSizeValues(containerStyle)

  return (
    <div
      className={styles.skeleton}
      style={{ ...normalizedStyles }}
    >
      <div
        className={styles.skeletonInner}
      >
        {shapeElements}
      </div>
    </div>
  )
}

Skeleton.propTypes = {
  containerStyle: PropTypes.shape({}).isRequired,
  shapes: PropTypes.arrayOf(PropTypes.shape({})).isRequired
}

export default Skeleton
