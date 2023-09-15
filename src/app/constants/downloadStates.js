const downloadStates = {
  active: 'ACTIVE',
  cancelling: 'CANCELLING',
  cancelled: 'CANCELLED',
  completed: 'COMPLETED',
  error: 'ERROR',
  errorFetchingLinks: 'ERROR_FETCHING_LINKS',
  interrupted: 'INTERRUPTED',
  paused: 'PAUSED',
  pending: 'PENDING',
  restarting: 'RESTARTING',
  starting: 'STARTING',
  waitingForAuth: 'WAITING_FOR_AUTH',
  waitingForEula: 'WAITING_FOR_EULA',
  appQuitting: 'APP_QUITTING'
}

export default downloadStates
