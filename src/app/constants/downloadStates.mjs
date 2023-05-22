// TODO Fix the duplication of the two downloadStates constant files.
// The duplication is required at the moment due to the way electron and vite each
// expect their modules.
const downloadStates = {
  pending: 'PENDING',
  active: 'ACTIVE',
  paused: 'PAUSED',
  interrupted: 'INTERRUPTED',
  error: 'ERROR',
  completed: 'COMPLETED'
}

export default downloadStates
