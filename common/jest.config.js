module.exports = {
  "moduleFileExtensions": ["js", "json", "ts"],
  "testRegex": ".(spec|test).ts$",
  "transform": {
    "^.+\\.ts$": "ts-jest"
  },
  "testEnvironment": "node",
  "globals": {
    "ts-jest": {
      "packageJson": "package.json"
    }
  }
}
