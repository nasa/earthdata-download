# Using Earthdata Download for your application

Earthdata Download was designed to be a bulk download application for [Earthdata Search](https://search.earthdata.nasa.gov), but can be reused by other applications with a bulk download need. In order to use your application with Earthdata Download, please follow this guide.

## Application Download Page

When integrating your application with Earthdata Download, please send your users to the following link for a first time download of the application.

    https://nasa.github.io/earthdata-download/

## Adding Trusted Sources

To extend Earthdata Download's list of trusted sources, please update the [trustedSources](../src/main/trustedSources.json) file by adding a new entry to the file and submitting a Pull Request. The key of JSON must match the domain of the API source and must use `https` or `http`. The body of the entry may contain any valid JSON.

Example

```json
{
  "my.domain.com": {"notes": "information about the domain" }
}
```

## Deep Link Formats

In order to have your web application launch the Earthdata Download application, you need to use [deep links](https://www.electronjs.org/docs/latest/tutorial/launch-app-from-url-in-another-app). The following links are examples used by Earthdata Search.

### Starting a new download

This link will start a new download in Earthdata Download.

```text
earthdata-download://startDownload?getLinks=http%3A%2F%2Flocalhost%3A3000%2Fgranule_links%3Fid%3D42%26flattenLinks%3Dtrue%26linkTypes%3Ddata&downloadId=shortName_versionId&clientId=eed-edsc-dev-serverless-client&token=Bearer mock-token
```

#### Query Parameters

| Hostname | Query Parameter | Required | Purpose |
| --- | --- | --- | --- |
| startDownload | | | This tells Earthdata Download that it needs to start a new download. |
| | downloadId | true | This is the name of the download that will be visible to the user. Suggested value: `<short name>_<version>`. A timestamp will be appended to this value in order to ensure the value is unique. |
| | getLinks | true | This is a URL that Earthdata Download will use to fetch the links it needs to download. [See more details on this request](GET_LINKS.md). |
| | authUrl | false | This is a URL where Earthdata Download can send the user to login with Earthdata Login. After logging in the user needs to be redirected to the Authentication callback. See [this document](EDL_AUTH.md) for more information on Earthdata Login authentication. |
| | eulaRedirectUrl | false | This is a URL that Earthdata Download will use as a redirect after the user is sent to Earthdata Login to accept a EULA. See [this document](EULA_CALLBACK.md) for more information on the EULA acceptance workflow. |
| | token | false | A token to be passed in the `getLinks` request. Value will be added to the `Authorization` header. |
| | clientId | false | The clientId for the application initiating the download. |

### Authentication callback

This link will add a new Earthdata Login token to Earthdata Download to be used when downloading files. See [this document](EDL_AUTH.md) for more information on Earthdata Login authentication.

```text
earthdata-download://authCallback?token=mock-token&fileId=1234
```

#### authCallbackQuery Parameters

| Hostname | Query Parameter | Required | Purpose |
| --- | --- | --- | --- |
| authCallback | | | This tells Earthdata Download that it needs to update the user's token and start downloading. |
| | fileId | true | This is the name of the download that will be visible to the user. Suggested value: `<short name>_<version>`. A timestamp will be appended to this value in order to ensure the value is unique. |
| | token | true | An EDL token to be included in the download request. Value will be sent as a Bearer token in the `Authorization` header. |

### EULA callback

This link can be called after Earthdata Download redirects the user to Earthdata Login to accept a EULA. See [this document](EULA_CALLBACK.md) for more information on the EULA acceptance workflow.

```text
earthdata-download://eulaCallback?fileId=1234
```

#### eulaCallback Query Parameters

| Hostname | Query Parameter | Required | Purpose |
| --- | --- | --- | --- |
| eulaCallback | | | This tells Earthdata Download that it needs to retry downloads that are waiting on EULA acceptance. |
| | fileId | true | This is the name of the download that will be visible to the user. Suggested value: `<short name>_<version>`. A timestamp will be appended to this value in order to ensure the value is unique. |
