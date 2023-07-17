import { useCallback, useReducer } from 'react'
import { nanoid } from 'nanoid'

const toastsReducer = (state, action) => {
  switch (action.type) {
    case 'ADD':
      return [...state, action.payload]
    case 'DELETE':
      return state.filter(({ id }) => id !== action.payload)
    default:
      throw new Error(`Unhandled action type (${action.type}) in toast reducer`)
  }
}

const useToasts = () => {
  const [toasts, toastsDispatch] = useReducer(toastsReducer, [])

  const addToast = useCallback(({
    actions,
    message,
    title,
    variant
  }) => {
    toastsDispatch({
      type: 'ADD',
      payload: {
        actions,
        id: nanoid(),
        message,
        title,
        variant
      }
    })
  }, [])

  const dismissToast = useCallback((id) => {
    toastsDispatch({
      type: 'DELETE',
      payload: id
    })
  }, [])

  return {
    toasts,
    addToast,
    dismissToast
  }
}

export default useToasts
