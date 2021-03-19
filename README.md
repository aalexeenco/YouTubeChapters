# YouTubeChapters Chrome extension

YouTubeChapters is a Chrome browser extension which adds chapter navigation controls to 
the YouTube player.


## Prerequisites

[Node.js](https://nodejs.org) v14.15.0 or higher.

## Installation

Clone the repository and use [npm](https://npmjs.com) to install module dependencies.

```bash
npm install
```

Then load an unpacked Chrome extension as follows:

1. Open Chrome browser.
2. Click `More` > `More Tools` > `Extensions` or enter `chrome://extensions` into the address bar.
3. Ensure `Developer mode` is turned on
4. Click `Load unpacked` button and select repository directory

## Running the tests

```bash
npm test
```

## Built With

* [@webcomponents/custom-elements](https://www.npmjs.com/package/@webcomponents/custom-elements) - A polyfill for the custom elements v1 spec
* [Jest](https://jestjs.io/) - JavaScript Testing Framework
* [ESLint](https://eslint.org)
* [Prettier](https://prettier.io)
* [VS Code](https://code.visualstudio.com/)

## License
[MIT](https://github.com/aalexeenco/YouTubeChapters/blob/master/LICENSE)