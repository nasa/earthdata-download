# Get Links Request

The [`getLinks` query parameter](./USE_EDD.md) is used as a way for Earthdata Download to fetch the download links from a web application.

Earthdata Download will send a `GET` request to the provided URL.

If authorization is needed by your API you can provide the `token` query paremeter. The value of that parameter will be added to the `Authorization` header for the request(s).

The first request Earthdata Download sends will append `&pageNum=1` to the `getLinks` URL. If your response includes a `cursor` value, subsequent requests will append `&cursor=<cursor value>` instead of an incrementing `pageNum`.

After the first page of links is received Earthdata Download will start the download. This will prompt the user to choose a download location, or start downloading if they have a default download location set.

## Expected Response

It is very important that your API returns the correct response to Earthdata Download. The response schema is located at [getLinksSchema.json](../src/main/getLinksSchema.json).

### Response Fields

| Field Name | Required | Purpose |
| --- | --- | --- |
| cursor | false | If your API utilizes a cursor to page through results, this value will be appended to the next request. |
| done | false | If true, Earthdata Download will not send further requests to your API. |
| links | true | Array of string URLS for the application to download. If no links are returned, Earthdata Download will not send furter requests to your API |

### Example Response

```js
{
  cursor: 'mock-cursor',
  done: false,
  links: [
    'http://example.com/link1',
    'http://example.com/link2',
    ...
  ]
}
```
