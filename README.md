# Earthdata Download

This README briefly describes how to bootstrap the Earthdata Download project. For more information about Earthdata Download, check out the `/docs` directory.

## Development

Ensure you are using the NodeJS version defined in `.nvmrc`

To install dependencies:

    npm install

In order to run the project locally you need to run Vite in one terminal:

    npm run dev

And you need to run Electron in a separate terminal:

    npm start

To run the Jest tests:

    npm test

To run the Playwright tests:

    npm run playwright

To build the jsdoc documentation:

    npm run docs

    # Outputs documentation in the `docs/jsdoc` directory

## Documentation

- [Introduction](docs/README.md)

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
