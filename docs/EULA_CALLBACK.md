# EULA Acceptance Workflow

If Earthdata Download receives the error below, it will forward the user to the `resolution_url`. A `redirect_uri` will be added to the `resolution_url`, and the value will be the `eulaRedirectUrl` you provide in your `startDownload` deep link.

Earthdata Download will add a `fileId` parameter to the provided `eulaRedirectUrl`, and that `fileId` needs to be returned to Earthdata Download in the `eulaCallback` deep link.

When the `eulaCallback` deep link is received Earthdata Download will retry the file that initially triggered the EULA redirect.

## EULA Error

```js
{
  status_code: 403,
  error_description: 'EULA Acceptance Failure',
  resolution_url: 'https://urs.earthdata.nasa.gov/approve_app?client_id=mock-client-id'
}
```
