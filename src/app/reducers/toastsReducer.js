/**
 * Initial State of this reducer.
 * `activeToasts` is an array of the active toasts that should be displayed
 * `dismissedToasts` is an object holding the dismissed toasts. The key/value pairs are the toastId/toastValue
 */
export const initialState = {
  activeToasts: {},
  dismissedToasts: {}
}

/**
 * Checks if the toast has already been dismissed with the same number of errors
 * @param {Object} state Current reducer state
 * @param {Object} toast Toast data to compare with dismissedToasts
 * @returns {Boolean}
 */
const isToastDismissed = (state, toast) => {
  const { dismissedToasts } = state

  const { id, numberErrors } = toast

  return dismissedToasts[id] && dismissedToasts[id].numberErrors >= numberErrors
}

export const toastsReducer = (state, action) => {
  switch (action.type) {
    case 'ADD_TOAST': {
      const { id } = action.payload

      // TODO if numberErrors has incremented, the new value isn't showing up

      // // If the incoming toast is ready active, don't add another toast to the active list
      // if (isToastAlreadyActive(state, id)) return state

      // If the incoming toast has been dismissed, don't add another toast to the active list
      if (isToastDismissed(state, action.payload)) return state

      return {
        ...state,
        activeToasts: {
          ...state.activeToasts,
          [id]: action.payload
        }
      }
    }
    case 'DISMISS_TOAST': {
      const dismissedToastId = action.payload

      // Get values for dismissed toast to put into state.dismissedToasts
      const dismissedToast = state.activeToasts[dismissedToastId]

      return {
        ...state,
        // activeToasts: state.activeToasts.filter((toast) => toast.id !== dismissedToastId),
        activeToasts: {
          ...state.activeToasts,
          [dismissedToastId]: undefined
        },
        dismissedToasts: {
          ...state.dismissedToasts,
          [dismissedToast.id]: dismissedToast
        }
      }
    }
    case 'DELETE_ALL_TOASTS_BY_ID': {
      // Delete all toasts related to the payload id
      const toastId = action.payload

      if (!toastId) return initialState

      return {
        ...state,
        // activeToasts: state.activeToasts.filter((toast) => toast.id !== toastId),
        activeToasts: {
          ...state.activeToasts,
          [toastId]: undefined
        },
        dismissedToasts: {
          ...state.dismissedToasts,
          [toastId]: undefined
        }
      }
    }
    default:
      throw new Error(`Unhandled action type (${action.type}) in toast reducer`)
  }
}
