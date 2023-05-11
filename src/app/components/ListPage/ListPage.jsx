import React from 'react'
import PropTypes from 'prop-types'

import * as styles from './ListPage.module.scss'

const ListPage = ({
  items,
  emptyMessage,
  Icon,
  actions
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
