const chalk = require("chalk");
const createPackage = require("./scripts/createPackage");
function create(params) {
    if (!params || !params[1]) {
        console.log(chalk.red("请输入包名，例如 nore create packagename"));
        return;
    }
    createPackage(params[1]);
}

module.exports = create;
