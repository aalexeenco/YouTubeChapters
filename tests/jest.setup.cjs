/* global global:false */
require("@testing-library/jest-dom");

global.chrome = {
  runtime: {
    getManifest: jest.fn(() => ({ version: '3.0.0' })),
    onMessage: {
      addListener: jest.fn(),
      removeListener: jest.fn(),
      hasListeners: jest.fn(() => false),
      callListeners: jest.fn(),
    },
    sendMessage: jest.fn(),
  },
  tabs: {
    query: jest.fn(),
  },
  // Add more namespaces
};

expect.objectOfTypeContaining = (expectedType, expectedProperties = {}) => ({
    asymmetricMatch(received) {
        const isCorrectType = received instanceof expectedType;
        const hasExpectedProperties = expect.objectContaining(expectedProperties).asymmetricMatch(received);
        return isCorrectType && hasExpectedProperties;
    },
    toString() {
        return `toBeEventOfTypeWith(${expectedType.name}, ${JSON.stringify(expectedProperties)})`;
    },
});