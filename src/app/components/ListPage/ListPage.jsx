import React, {
  useCallback,
  useEffect,
  useRef,
  useState
} from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import SimpleBar from 'simplebar-react'

import * as styles from './ListPage.module.scss'

/**
 * @typedef {Object} ListPageProps
 * @property {React.ReactNode} [actions] An optional React node which is displayed when an empty state is visible.
 * @property {String} emptyMessage A string which is displayed as the description when an empty state is visible.
 * @property {React.ReactNode} [header] An optional React node which is displayed as the header for the page.
 * @property {Function} [Icon] An optional react-icons icon.
 * @property {Array} items An array of React nodes
 * @property {React.ReactNode} [errorToasts] An optional React node which is displayed when a download item is an an error state.
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
 *     errorToasts={}
 *   />
 * )
 */
const ListPage = ({
  actions,
  emptyMessage,
  header,
  Icon,
  items,
  errorToasts
}) => {
  const scrollableNodeRef = useRef(null)
  const [hasScrolledList, setHasScrolledList] = useState(false)

  const onScrollList = useCallback(({ target }) => {
    const { scrollTop } = target
    setHasScrolledList(scrollTop !== 0)
  }, [scrollableNodeRef])

  useEffect(() => {
    if (scrollableNodeRef.current) {
      scrollableNodeRef.current.addEventListener('scroll', onScrollList)
    }

    return () => {
      if (scrollableNodeRef.current) {
        scrollableNodeRef.current.addEventListener('scroll', onScrollList)
      }
    }
  }, [scrollableNodeRef.current])

  return (
    <section className={
      classNames([
        styles.listPage,
        {
          [styles.isEmptyState]: !items.length,
          [styles.hasScrolledList]: hasScrolledList
        }
      ])
    }
    >
      {
        items && items.length
          ? (
            <>
              {
                header && (
                  <header className={styles.header}>
                    {header}
                  </header>
                )
              }
              <div className={styles.contentWrapper}>
                <div className={styles.scrollableWrapper}>
                  <SimpleBar scrollableNodeProps={{ ref: scrollableNodeRef }} className={styles.listWrapper} style={{ height: '100%' }}>
                    <ul
                      className={styles.list}
                    >
                      {items}
                    </ul>
                  </SimpleBar>
                </div>
              </div>
            </>
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
      {
        errorToasts && (
          errorToasts
        )
      }
    </section>
  )
}

ListPage.defaultProps = {
  actions: null,
  emptyMessage: null,
  header: null,
  Icon: null,
  errorToasts: null
}

ListPage.propTypes = {
  actions: PropTypes.node,
  emptyMessage: PropTypes.string,
  header: PropTypes.node,
  items: PropTypes.arrayOf(PropTypes.node).isRequired,
  Icon: PropTypes.func,
  errorToasts: PropTypes.node
}

export default ListPage
