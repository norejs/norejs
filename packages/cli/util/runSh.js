const { spawn } = require('child_process');
// 运行command 并且 在控制台输出
function runSh(execStr, options = {}, callback = () => {}) {
    const args = execStr.split(' ');
    const command = args.shift();
    spawn(command, args, options);
    
}
module.exports = runSh;
