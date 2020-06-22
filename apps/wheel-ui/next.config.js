const withTM = require("next-transpile-modules")(["@potter/ui-shared"]);

module.exports = withTM({
  env: {
    WHEEL_URL: process.env.WHEEL_URL || "http://localhost:3001",
    WHEEL_SOCKETIO_URL: process.env.WHEEL_SOCKETIO_URL || "http://localhost:3010"
  }
});
