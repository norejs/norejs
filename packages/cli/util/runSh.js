const { exec } = require("child_process");
function runSh(execStr, options = {}, callback = () => {}) {
    exec(execStr, options, (error, stdout, stderr) => {
        if (error !== null) {
            console.error(`exec error: ${error}`);
        }
        callback(error, stdout, stderr);
    });
}

module.exports = runSh;
