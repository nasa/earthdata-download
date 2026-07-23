const RELEASES_API_URL = 'https://api.github.com/repos/nasa/earthdata-download/releases/latest'

/**
 * Fetches the latest published release tag from the GitHub API.
 * The download buttons always link to `releases/latest`, so the tag returned
 * here matches the version a user is about to download.
 * @returns {Promise<string|null>} The version string (e.g. `1.0.9`) or null if it could not be determined.
 */
export async function getLatestVersion() {
  try {
    const response = await fetch(RELEASES_API_URL, {
      headers: { Accept: 'application/vnd.github+json' }
    })

    if (!response.ok) return null

    const { tag_name: tagName } = await response.json()

    if (!tagName) return null

    // Release tags are prefixed with `v` (e.g. `v1.0.9`); strip it for display.
    return tagName.replace(/^v/, '')
  } catch {
    return null
  }
}

/**
 * Populates the given element with the latest release version and reveals it.
 * If the version cannot be determined the element is left hidden so the page
 * degrades gracefully.
 * @param {HTMLElement} element The element to display the version in.
 */
export async function setVersionNumber(element) {
  if (!element) return

  const version = await getLatestVersion()

  if (!version) return

  element.textContent = `Version ${version}`
  element.removeAttribute('hidden')
}
