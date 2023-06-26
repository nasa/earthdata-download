import downloadStates from './downloadStates'

const humanizedDownloadStates = {
  [downloadStates.active]: 'Downloading',
  [downloadStates.completed]: 'Completed',
  [downloadStates.error]: 'Errored',
  [downloadStates.interrupted]: 'Interrupted',
  [downloadStates.paused]: 'Paused',
  [downloadStates.pending]: 'Initializing'
}

const getHumanizedDownloadStates = (state, percent = 0) => {
  if (state === downloadStates.waitingForAuth) {
    if (percent > 0) return humanizedDownloadStates[downloadStates.interrupted]

    return humanizedDownloadStates[downloadStates.pending]
  }

  return humanizedDownloadStates[state]
}

export default getHumanizedDownloadStates
