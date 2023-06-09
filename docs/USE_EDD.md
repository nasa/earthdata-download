# Using Earthdata Download for your application

EDD was designed to be a bulk download application for [Earthdata Search](https://search.earthdata.nasa.gov), but can be reused by other applications with a bulk download need. In order to use your application with EDD, please follow this guide.

## Deep Link Format

In order to have your web application launch the EDD application, you need to use [deep links](https://www.electronjs.org/docs/latest/tutorial/launch-app-from-url-in-another-app). The following link is an example used by Earthdata Search

    earthdata-download://startDownload?getLinks=http%3A%2F%2Flocalhost%3A3000%2Fgranule_links%3Fid%3D42%26flattenLinks%3Dtrue%26linkTypes%3Ddata&downloadId=shortName_versionId&token=Bearer mock-token

### Query Parameters

| Hostname | Query Parameter | Required | Purpose |
| --- | --- | --- | --- |
| startDownload | | | This tells EDD that it needs to start a new download |
| | downloadId | true | This is the name of the download that will be visible to the user. Suggested value: `<short name>_<version>`. A timestamp will be appended to this value in order to ensure the value is unique. |
| | getLinks | true | This is a URL that EDD will use to fetch the links it needs to download. [See more details on this request](GETLINKS.md) |
| | token | false | A token to be passed in the `getLinks` request. Value will be added to the `Authorization` header |
