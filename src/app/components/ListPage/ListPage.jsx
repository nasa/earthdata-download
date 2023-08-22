import React, {
  useCallback,
  useEffect,
  useRef,
  useState
} from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import SimpleBar from 'simplebar-react'
import { FixedSizeList } from 'react-window'
import AutoSizer from 'react-virtualized-auto-sizer'

import ListPageListItem from './ListPageListItem'

import * as styles from './ListPage.module.scss'

/**
 * @typedef {Object} ListPageProps
 * @property {React.ReactNode} [actions] An optional React node which is displayed when an empty state is visible.
 * @property {String} emptyMessage A string which is displayed as the description when an empty state is visible.
 * @property {React.ReactNode} [header] An optional React node which is displayed as the header for the page.
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
  header,
  hideCompleted,
  Icon,
  items,
  listRef,
  setWindowState
}) => {
  const scrollableNodeRef = useRef(null)
  const infiniteLoaderRef = useRef(null)
  const [hasScrolledList, setHasScrolledList] = useState(false)

  const onScrollList = useCallback(({ target }) => {
    const { scrollTop } = target

    setHasScrolledList(scrollTop !== 0)

    if (infiniteLoaderRef.current) {
      infiniteLoaderRef.current.resetloadMoreItemsCache()
    }
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

  const onItemsRendered = (windowState) => {
    setWindowState(windowState)
  }

  // TODO simplebar-mouse-entered is getting added to the simplebar element and causing a tiny dot to appear and top and left of y & x scrollbars
  // TODO Y scrollbar has too much space beside it, between scrollbar and right edge of DownloadItem
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
        (items && items.length) || hideCompleted
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
                  {
                    // TODO this screws up the header width
                    hideCompleted && items.length === 0 && (
                      <div>
                        No Items remaining
                      </div>
                    )
                  }

                  <SimpleBar
                    className={styles.listWrapper}
                    style={{ height: '100%' }}
                  >
                    {
                      ({ contentNodeRef }) => (
                        <AutoSizer className={styles.list}>
                          {
                            ({ height, width }) => (
                              <FixedSizeList
                                height={height}
                                innerRef={contentNodeRef}
                                itemCount={items.length}
                                itemData={items}
                                itemSize={97}
                                onItemsRendered={onItemsRendered}
                                outerRef={scrollableNodeRef}
                                ref={listRef}
                                width={width}
                                overscanCount={4}
                              >
                                {ListPageListItem}
                              </FixedSizeList>
                            )
                          }
                        </AutoSizer>
                      )
                    }
                  </SimpleBar>
                </div>
              </div>
            </>
          )
          : (
            <div className={styles.content}>
              {
                Icon && (
                  <Icon className={styles.icon} />
                )
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
}

ListPage.defaultProps = {
  actions: null,
  emptyMessage: null,
  header: null,
  hideCompleted: false,
  Icon: null,
  listRef: {},
  setWindowState: () => {}
}

ListPage.propTypes = {
  actions: PropTypes.node,
  emptyMessage: PropTypes.string,
  header: PropTypes.node,
  Icon: PropTypes.func,
  items: PropTypes.arrayOf(
    PropTypes.shape({})
  ).isRequired,
  listRef: PropTypes.shape({}),
  setWindowState: PropTypes.func,
  hideCompleted: PropTypes.bool
}

export default ListPage
