const base = require('../../common/jest.config');
const packageJson = require('./package.json')

module.exports = {
  ...base,
  displayName: packageJson.name
};
