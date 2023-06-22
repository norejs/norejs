const isDev = true;
const buildV2 = require("./scripts/build_v2");
module.exports = function ({ version = "v1" } = {}) {
    console.log("build", version);
    buildV2(isDev);
};
