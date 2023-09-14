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

import { REPORT_INTERVAL } from '../../constants/reportInterval'
import useAppContext from '../../hooks/useAppContext'

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
  fetchReport,
  header,
  hideCompleted,
  Icon,
  items,
  itemSize,
  listRef,
  totalItemCount
}) => {
  const { toasts } = useAppContext()
  const { activeToasts } = toasts

  const scrollableNodeRef = useRef(null)
  const infiniteLoaderRef = useRef(null)
  const [hasScrolledList, setHasScrolledList] = useState(false)
  const [windowState, setWindowState] = useState({})

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

  useEffect(() => {
    const loadItems = async () => {
      await fetchReport(windowState)
    }

    loadItems()

    const interval = setInterval(() => {
      loadItems()
    }, REPORT_INTERVAL)

    return () => {
      clearInterval(interval)
    }
  }, [windowState, hideCompleted, activeToasts])

  const onItemsRendered = (newWindowState) => {
    setWindowState(newWindowState)
  }

  // TODO Trevor simplebar-mouse-entered is getting added to the simplebar element and causing a tiny dot to appear and top and left of y & x scrollbars
  // TODO Trevor Y scrollbar has too much space beside it, between scrollbar and right edge of DownloadItem
  return (
    <section className={
      classNames([
        styles.listPage,
        {
          [styles.isEmptyState]: !items.length && !hideCompleted,
          [styles.hasScrolledList]: hasScrolledList
        }
      ])
    }
    >
      {
        totalItemCount > 0 || hideCompleted
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
                    // TODO Trevor make pretty
                    items.length === 0 && (
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
                                itemCount={totalItemCount}
                                itemData={items}
                                itemSize={itemSize}
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
  totalItemCount: 0
}

ListPage.propTypes = {
  actions: PropTypes.node,
  emptyMessage: PropTypes.string,
  fetchReport: PropTypes.func.isRequired,
  header: PropTypes.node,
  Icon: PropTypes.func,
  items: PropTypes.arrayOf(
    PropTypes.shape({})
  ).isRequired,
  itemSize: PropTypes.number.isRequired,
  listRef: PropTypes.shape({}),
  totalItemCount: PropTypes.number,
  hideCompleted: PropTypes.bool
}

export default ListPage
