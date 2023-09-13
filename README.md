# Earthdata Download Github Page

The `gh-pages` branch of the repo is used to build the Github Pages page for Earthdata Download. This serves as the main download page for the application.

## Local Development

1. Run `npm install`
2. Run `npm run dev`

## Environment Variables

Environment variables are used to define the download location and download size for each of the images. These values are defined in the `.env` file.

## Icons

In order to keep the page as lean as possible, SVG icons have been imported from Font Awesome. The icon SVG XML was pulled directly from the [Font Awesome](https://fontawesome.com/icons/l) website, with the addition of `class` and `fill` attributes.

## Deployment

The page will be rebuilt and deployed upon changes to the gh-pages branch.
