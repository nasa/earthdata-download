import downloadStates from './downloadStates'

const humanizedDownloadStates = {
  [downloadStates.active]: 'Downloading',
  [downloadStates.cancelled]: 'Cancelled',
  [downloadStates.completed]: 'Completed',
  [downloadStates.error]: 'An error occurred',
  [downloadStates.interrupted]: 'Interrupted',
  [downloadStates.paused]: 'Paused',
  [downloadStates.pending]: 'Initializing',
  [downloadStates.starting]: 'Initializing'
}

const getHumanizedDownloadStates = (state, percent = 0, hasErrors = false) => {
  if (state === downloadStates.waitingForAuth || state === downloadStates.waitingForEula) {
    if (percent > 0) return humanizedDownloadStates[downloadStates.interrupted]

    return humanizedDownloadStates[downloadStates.pending]
  }

  return `${humanizedDownloadStates[state]}${hasErrors ? ' with errors' : ''}`
}

export default getHumanizedDownloadStates
