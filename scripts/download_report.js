const url = 'https://api.github.com/repos/nasa/earthdata-download/releases'

const linuxDownloadNames = [
  'Earthdata-Download-amd64.deb',
  'Earthdata-Download-x86_64.AppImage',
  'Earthdata-Download-x86_64.rpm'
]
const linuxUpdateNames = [

]
const macDownloadNames = [
  'Earthdata-Download-arm64.dmg',
  'Earthdata-Download-x64.dmg'
]
const macUpdateNames = [
  'Earthdata-Download-arm64.dmg.blockmap',
  'Earthdata-Download-arm64.zip',
  'Earthdata-Download-x64.dmg.blockmap',
  'Earthdata-Download-x64.zip'
]
const windowsDownloadNames = [
  'Earthdata-Download-x64.exe'
]
const windowsUpdateNames = [
  'Earthdata-Download-x64.exe.blockmap'
]
const allDownloadNames = [
  ...linuxDownloadNames,
  ...macDownloadNames,
  ...windowsDownloadNames
]
const allUpdateNames = [
  ...linuxUpdateNames,
  ...macUpdateNames,
  ...windowsUpdateNames
]

// Fetch the releases info from the GitHub API
fetch(url)
  .then((response) => response.json())
  .then((releases) => {
    // Total number of downloads
    let totalDownloadCount = 0
    let linuxDownloadCount = 0
    let macDownloadCount = 0
    let windowsDownloadCount = 0
    let totalUpdateCount = 0
    let linuxUpdateCount = 0
    let macUpdateCount = 0
    let windowsUpdateCount = 0

    // An object to track each release, and the number of downloads in each release.
    const downloadCounts = {}

    // Loop through each release
    releases.forEach((release) => {
      const {
        assets,
        name: releaseName
      } = release
      let releaseDownloads = 0
      let linuxReleaseDownloads = 0
      let macReleaseDownloads = 0
      let windowsReleaseDownloads = 0
      let releaseUpdates = 0
      let linuxReleaseUpdates = 0
      let macReleaseUpdates = 0
      let windowsReleaseUpdates = 0

      // Add this release to the counter
      downloadCounts[releaseName] = {
        files: {}
      }

      // Loop through each file in the release
      assets.forEach((asset) => {
        const {
          download_count: downloadCount,
          name: fileName
        } = asset

        // `latest-*.yml` files are used in the auto-update system. We won't count these files
        if (fileName.startsWith('latest')) return

        // Add the file to the list of files for this release.
        downloadCounts[releaseName].files[fileName] = downloadCount

        // Increment counters
        if (allDownloadNames.includes(fileName)) {
          releaseDownloads += downloadCount
          totalDownloadCount += downloadCount
        }

        if (allUpdateNames.includes(fileName)) {
          releaseUpdates += downloadCount
          totalUpdateCount += downloadCount
        }

        if (macDownloadNames.includes(fileName)) {
          macReleaseDownloads += downloadCount
          macDownloadCount += downloadCount
        }

        if (macUpdateNames.includes(fileName)) {
          macReleaseUpdates += downloadCount
          macUpdateCount += downloadCount
        }

        if (windowsDownloadNames.includes(fileName)) {
          windowsReleaseDownloads += downloadCount
          windowsDownloadCount += downloadCount
        }

        if (windowsUpdateNames.includes(fileName)) {
          windowsReleaseUpdates += downloadCount
          windowsUpdateCount += downloadCount
        }

        if (linuxDownloadNames.includes(fileName)) {
          linuxReleaseDownloads += downloadCount
          linuxDownloadCount += downloadCount
        }

        if (linuxUpdateNames.includes(fileName)) {
          linuxReleaseUpdates += downloadCount
          linuxUpdateCount += downloadCount
        }
      })

      // Add the total number of downloads for this release
      downloadCounts[releaseName] = {
        [`${releaseName} Downloads`]: releaseDownloads,
        [`${releaseName} Auto Updates`]: releaseUpdates,
        [`${releaseName} Linux Downloads`]: linuxReleaseDownloads,
        [`${releaseName} Linux Auto Updates`]: linuxReleaseUpdates,
        [`${releaseName} MacOS Downloads`]: macReleaseDownloads,
        [`${releaseName} MacOS Auto Updates`]: macReleaseUpdates,
        [`${releaseName} Windows Downloads`]: windowsReleaseDownloads,
        [`${releaseName} Windows Auto Updates`]: windowsReleaseUpdates,
        ...downloadCounts[releaseName]
      }
    })

    console.log('Total Downloads: ', totalDownloadCount)
    console.log('Total Auto Updates: ', totalUpdateCount)
    console.log('Linux Downloads: ', linuxDownloadCount)
    console.log('Linux Auto Updates: ', linuxUpdateCount)
    console.log('MacOS Downloads: ', macDownloadCount)
    console.log('MacOS Auto Update: ', macUpdateCount)
    console.log('Windows Downloads: ', windowsDownloadCount)
    console.log('Windows Auto Update: ', windowsUpdateCount)
    console.log('downloadCounts: ', JSON.stringify(downloadCounts, null, 2))
  })
