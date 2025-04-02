# Earthdata Login Authentication

Earthdata Download will send an Earthdata Login token with the download request if you provide a token. When Earthdata Download tries to download a file and is redirected to an Earthdata Login login page, it will instead open an external browser and navigate to the `authUrl` provided in the [startDownload](USE_EDD.md#starting-a-new-download) deep link.

The result of the `authUrl` page's redirect should result in the user being sent to the [authCallback](USE_EDD.md#authentication-callback) deep link. This deep link will add the new Earthdata Login token to the Earthdata Download app, and restart the download of the file that triggered the authentication workflow.

## startDownload - authUrl

The authUrl in the startDownload deep link must include the `eddRedirect` query paramter with the value `earthdata-download://authCallback`. As a URL-encoded string, this looks like: `eddRedirect=earthdata-download%3A%2F%2FauthCallback`.

The authUrl will have a `fileId` parameter appended to it by Earthdata Download, which is the file ID of the file that triggered the authentication workflow. This `fileId` parameter needs to be returned in the [authCallback](USE_EDD.md#authentication-callback) deep link, in order to restart downloading that file.
