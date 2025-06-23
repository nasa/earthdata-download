const downloadStates = {
  active: 'ACTIVE',
  cancelling: 'CANCELLING',
  cancelled: 'CANCELLED',
  completed: 'COMPLETED',
  error: 'ERROR',
  errorFetchingLinks: 'ERROR_FETCHING_LINKS',
  interrupted: 'INTERRUPTED',
  interruptedCanResume: 'INTERRUPTED_CAN_RESUME',
  interruptedCanNotResume: 'INTERRUPTED_CAN_NOT_RESUME',
  paused: 'PAUSED',
  pending: 'PENDING',
  starting: 'STARTING',
  waitingForAuth: 'WAITING_FOR_AUTH',
  waitingForEula: 'WAITING_FOR_EULA',
  appQuitting: 'APP_QUITTING'
}

export default downloadStates
