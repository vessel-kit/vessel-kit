const withTM = require("next-transpile-modules")(["@potter/ui-shared"]);

module.exports = withTM({
  env: {
    ANCHORING_URL: process.env.ANCHORING_URL || "http://localhost:3000"
  }
});
