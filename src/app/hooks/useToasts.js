import { useCallback, useReducer } from 'react'

import { initialState, toastsReducer } from '../reducers/toastsReducer'

const useToasts = () => {
  const [toasts, toastsDispatch] = useReducer(toastsReducer, initialState)

  /**
   * Add a new toast
   */
  const addToast = useCallback(({
    actions,
    id,
    message,
    numberErrors,
    title,
    variant
  }) => {
    toastsDispatch({
      type: 'ADD_TOAST',
      payload: {
        actions,
        id,
        message,
        numberErrors,
        title,
        variant
      }
    })
  }, [])

  /**
   * Dismiss a toast
   */
  const dismissToast = useCallback((id) => {
    toastsDispatch({
      type: 'DISMISS_TOAST',
      payload: id
    })
  }, [])

  /**
   * Delete all toasts (active or dismissed) given an ID
   */
  const deleteAllToastsById = useCallback((id) => {
    toastsDispatch({
      type: 'DELETE_ALL_TOASTS_BY_ID',
      payload: id
    })
  }, [])

  return {
    toasts,
    addToast,
    dismissToast,
    deleteAllToastsById
  }
}

export default useToasts
