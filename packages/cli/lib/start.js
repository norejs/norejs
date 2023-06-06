const isDev = true;
const buildV2 = require("./scripts/build_v2");
module.exports = function ({ version = "v1" } = {}) {
    buildV2(isDev);
};
