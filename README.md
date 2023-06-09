# Earthdata Download

![Version](https://img.shields.io/github/v/release/nasa/earthdata-download?display_name=tag&label=Version&sort=semver)
![Build Status](https://github.com/nasa/earthdata-download/workflows/CI/badge.svg?branch=main)
[![codecov](https://codecov.io/gh/nasa/earthdata-download/branch/main/graph/badge.svg?token=W6E082B30M)](https://codecov.io/gh/nasa/earthdata-download)

This README briefly describes how to bootstrap the Earthdata Download project. For more information about Earthdata Download, check out the `/docs` directory.

## Development

Ensure you are using the NodeJS version defined in `.nvmrc`

To install dependencies:

    npm install

In order to run the project locally you need to run:

    npm start

To run the Jest tests:

    npm test

To run the Playwright tests:

    npm run playwright

To build the jsdoc documentation:

    npm run docs

    # Outputs documentation in the `docs/jsdoc` directory

## Building

To build the installers run one of the following, matching your operating system:

    npm run dist:mac
    npm run dist:win
    npm run dist:linux

## Create a Release

To create a new release, first ensure you bump the `version` in [package.json](package.json) and run `npm install` as part of your pull request.

After your PR has been merged, create a new tag that matches your package.json `version`, prepended by the letter `v`

    git tag -a "v1.4.2" -m "v1.4.2 Release"

And push that tag to GitHub

    git push --tags

That will trigger the Build/Release workflow, and create a new draft release matching your `version`.

## Documentation

- [Introduction](docs/README.md)
- [Use EDD for Your Application](docs/USE_EDD.md)

## License

> Copyright © 2007-2023 United States Government as represented by the Administrator of the National Aeronautics and Space Administration. All Rights Reserved.
>
> Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License.
> You may obtain a copy of the License at
>
> <http://www.apache.org/licenses/LICENSE-2.0>
>
>Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS,
>WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
