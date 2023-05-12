import React from 'react'
import PropTypes from 'prop-types'

import * as styles from './ListPage.module.scss'

/**
 * @typedef {Object} ListPageProps
 * @property {React.ReactNode} [actions] An optional React node which is displayed when an empty state is visible.
 * @property {String} emptyMessage A string which is displayed as the description when an empty state is visibile.
 * @property {Function} [Icon] An optional react-icons icon.
 * @property {Array} items An array of React nodes
 */

/**
 * Renders a `ListPage` page.
 * @param {ListPageProps} props
 *
 * @example <caption>Render a ListPage component.</caption>
 *
 * return (
 *   <ListPage
 *     actions={(
 *       <Button>Do something!<Button>
 *     )}
 *     emptyMessage={"You have nothing to show!"}
 *     Icon={FaQuestionCircle}
 *     items={[]}
 *   />
 * )
 */
const ListPage = ({
  actions,
  emptyMessage,
  Icon,
  items
}) => (
  <section className={styles.listPage}>
    {
      items && items.length
        ? (
          <ul className={styles.list}>
            {items}
          </ul>
        )
        : (
          <div className={styles.content}>
            {
              Icon && <Icon className={styles.icon} />
            }
            <p className={styles.message}>{emptyMessage}</p>
            {
              actions && (
                <div className={styles.actions}>
                  {actions}
                </div>
              )
            }
          </div>
        )
    }
  </section>
)

ListPage.defaultProps = {
  actions: null,
  emptyMessage: null,
  Icon: null
}

ListPage.propTypes = {
  items: PropTypes.arrayOf(PropTypes.node).isRequired,
  emptyMessage: PropTypes.string,
  Icon: PropTypes.func,
  actions: PropTypes.node
}

export default ListPage
