# YouTubeChapters Chrome extension

[![tests](https://github.com/aalexeenco/YouTubeChapters/actions/workflows/build.yml/badge.svg)](https://github.com/aalexeenco/YouTubeChapters/actions/workflows/build.yml)
[![codecov](https://codecov.io/gh/aalexeenco/YouTubeChapters/branch/master/graph/badge.svg?token=RA8SD35X9Q)](https://codecov.io/gh/aalexeenco/YouTubeChapters)
[![version](https://img.shields.io/github/v/release/aalexeenco/YouTubeChapters)](https://github.com/aalexeenco/YouTubeChapters/releases/latest)
![commits since latest release](https://img.shields.io/github/commits-since/aalexeenco/YouTubeChapters/latest)


YouTubeChapters is a Chrome browser extension which adds chapter navigation controls to 
the YouTube player.

## Getting Started

## Installation

Download the [latest](https://github.com/aalexeenco/YouTubeChapters/releases/latest/download/yt_chapters_chrome_ext.zip) version and extract to a desired location and then load an unpacked Chrome extension as follows:

1. Open Chrome browser.
2. Click `More` > `More Tools` > `Extensions` or enter `chrome://extensions` into the address bar.
3. Ensure `Developer mode` is turned on
4. Click `Load unpacked` button and select the directory with unpacked extension files

## Development

### Prerequisites

[Node.js](https://nodejs.org) v14.15.0 or higher.

### Setup

Clone the repository and use [npm](https://npmjs.com) to install module dependencies:

```bash
npm install
```

### Building

To build extension run the npm `build` script, which will pack extension files to the `dist` directory:

```bash
npm run build
```

Then open Chrome browser and load an unpacked Chrome extension from the `dist` directory or reload extension if it is installed already.

### Running the tests

```bash
npm test
```

## Built With

* [@webcomponents/custom-elements](https://www.npmjs.com/package/@webcomponents/custom-elements) - A polyfill for the custom elements v1 spec
* [Jest](https://jestjs.io/) - JavaScript Testing Framework
* [ESLint](https://eslint.org)
* [Prettier](https://prettier.io)
* [copyfiles][1], [npm-run-all][2], [rimraf][3]
* [VS Code](https://code.visualstudio.com/)

## License
[MIT](./LICENSE)

[1]: https://www.npmjs.com/package/copyfiles
[2]: https://www.npmjs.com/package/npm-run-all
[3]: https://www.npmjs.com/package/rimraf
