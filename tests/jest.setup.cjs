/* global global:false */
require("@testing-library/jest-dom");

Object.assign(global, require("jest-chrome"));

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