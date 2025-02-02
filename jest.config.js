/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest/presets/js-with-ts',
  testEnvironment: 'node',
  moduleNameMapper: {
    '^@seryucargo/(.*)$': '<rootDir>/src/$1',
  },
};
