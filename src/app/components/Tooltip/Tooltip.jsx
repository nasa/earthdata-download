import React, { forwardRef } from 'react'
import PropTypes from 'prop-types'
import * as RadixTooltip from '@radix-ui/react-tooltip'

import delayDurations from '../../constants/delayDurations'

import * as styles from './Tooltip.module.scss'

/**
 * @typedef {Object} TooltipProps
 * @property {React.ReactNode} [additionalContent]  A React node to be used as the additional content for the tooltip.
 * @property {React.ReactNode} children A React node to be wrapped in the tooltip trigger.
 * @property {React.ReactNode} content A React node to be used as the content for the tooltip.
 * @property {('slow')} [duration] A number representing the tooltip delay in milliseconds.
 * @property {Boolean} open A boolean representing the "open" state of the tooltip.
*/

/**
 * Renders a `Tooltip` component.
 * @param {TooltipProps} props
 *
 * @example <caption>Render the tooltip as a `tooltip` element.</caption>
 *
 * return (
 *   <Tooltip
 *      content="I show on hover"
 *      additionalContent="Me too!"
 *      duration="slow"
 *   >
 *      Hover me
 *   </Tooltip>
 * )
 */
const Tooltip = forwardRef(({
  additionalContent,
  children,
  content,
  duration,
  open
}, ref) => {
  const conditionalRootProps = {}

  const tooltipDuration = delayDurations[duration]

  if (open) conditionalRootProps.open = true

  return (
    <RadixTooltip.Provider delayDuration={tooltipDuration}>
      <RadixTooltip.Root {...conditionalRootProps} ref={ref}>
        <RadixTooltip.Trigger asChild>
          {children}
        </RadixTooltip.Trigger>
        <RadixTooltip.Portal>
          <RadixTooltip.Content
            className={styles.tooltipContent}
            sideOffset={5}
          >
            <div>
              <span className={styles.content}>{content}</span>
              {
                additionalContent && (
                  <span className={styles.additionalContent}>{additionalContent}</span>
                )
              }
            </div>
            <RadixTooltip.Arrow className={styles.tooltipArrow} />
          </RadixTooltip.Content>
        </RadixTooltip.Portal>
      </RadixTooltip.Root>
    </RadixTooltip.Provider>
  )
})

Tooltip.displayName = 'Tooltip'

Tooltip.defaultProps = {
  additionalContent: null,
  duration: 'default',
  open: null
}

Tooltip.propTypes = {
  additionalContent: PropTypes.node,
  duration: PropTypes.oneOf(['default', 'slow']),
  children: PropTypes.node.isRequired,
  content: PropTypes.node.isRequired,
  open: PropTypes.bool
}

export default Tooltip
