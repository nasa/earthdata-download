import React from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import * as RadixProgress from '@radix-ui/react-progress'

import createVariantClassName from '../../utils/createVariantClassName'

import * as styles from './Progress.module.scss'

const Progress = ({
  className,
  progress,
  state
}) => (
  <RadixProgress.Root
    className={
      classNames([
        styles.root,
        styles[createVariantClassName(state)],
        className
      ])
    }
    value={progress}
  >
    <RadixProgress.Indicator
      className={styles.indicator}
      style={{ transform: `translateX(-${100 - progress}%)` }}
    />
  </RadixProgress.Root>
)

Progress.propTypes = {
  className: PropTypes.string.isRequired,
  progress: PropTypes.number.isRequired,
  state: PropTypes.string.isRequired
}

export default Progress
