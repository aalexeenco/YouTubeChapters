# YouTubeChapters browser extension

[![tests](https://github.com/aalexeenco/YouTubeChapters/actions/workflows/build.yml/badge.svg)](https://github.com/aalexeenco/YouTubeChapters/actions/workflows/build.yml)
[![codecov](https://codecov.io/gh/aalexeenco/YouTubeChapters/branch/master/graph/badge.svg?token=RA8SD35X9Q)](https://codecov.io/gh/aalexeenco/YouTubeChapters)
[![version](https://img.shields.io/github/v/release/aalexeenco/YouTubeChapters)](https://github.com/aalexeenco/YouTubeChapters/releases/latest)
![commits since latest release](https://img.shields.io/github/commits-since/aalexeenco/YouTubeChapters/latest)


YouTubeChapters is a browser extension which adds chapter navigation controls to 
the YouTube player.

## Getting Started

## Installation

 Download the archive and extract the contents to a desired location and then load the extension manually:

### Chrome

1. Download the [latest](https://github.com/aalexeenco/YouTubeChapters/releases/latest/download/yt_chapters_ext.zip) version
2. Open Chrome browser
3. Click `Customize and control Google Chrome` > `More Tools` > `Extensions` or enter `chrome://extensions` into the address bar
4. Ensure `Developer mode` is turned on
5. Click `Load unpacked` button and select the extension's directory

### Firefox

1. Download the [latest](https://github.com/aalexeenco/YouTubeChapters/releases/latest/download/yt_chapters_ext_firefox.zip) version
2. Open Firefox browser
3. Open `about:debugging` page
4. Click `This Firefox`, click `Load Temporary Add-on` and then select any file in the extension's directory

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

Then add extension manually from the `dist` directory or reload extension if it is installed already.

### Running the tests

```bash
npm test
```

## Built With

* [Babel](https://babeljs.io/)
* [cross-var](https://www.npmjs.com/package/cross-var)
* [ESLint](https://eslint.org)
* [Jest](https://jestjs.io/) - JavaScript Testing Framework
* [jest-stare](https://www.npmjs.com/package/jest-stare) - Jest HTML Reporter
* [Prettier](https://prettier.io)
* [Testing Library](https://testing-library.com/)
* [yvar](https://www.npmjs.com/package/yvar)
* [VS Code](https://code.visualstudio.com/)
* [Git Release](https://github.com/marketplace/actions/git-release) -
A GitHub Action for creating a GitHub Release with Assets and Changelog

## License
[MIT](./LICENSE)
