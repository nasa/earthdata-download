import downloadStates from './downloadStates'

const humanizedDownloadStates = {
  [downloadStates.active]: 'Downloading',
  [downloadStates.cancelled]: 'Cancelled',
  [downloadStates.completed]: 'Complete',
  [downloadStates.errorFetchingLinks]: 'The download could not be started.',
  [downloadStates.error]: 'An error occurred',
  [downloadStates.interrupted]: 'Interrupted',
  [downloadStates.paused]: 'Paused',
  [downloadStates.pending]: 'Not yet started',
  [downloadStates.starting]: 'Initializing'
}

const getHumanizedDownloadStates = (state, percent = 0) => {
  if (state === downloadStates.waitingForAuth || state === downloadStates.waitingForEula) {
    if (percent > 0) return humanizedDownloadStates[downloadStates.interrupted]

    return humanizedDownloadStates[downloadStates.pending]
  }

  return humanizedDownloadStates[state]
}

export default getHumanizedDownloadStates
