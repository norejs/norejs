const { spawnSync, spawn } = require("child_process");
const path = require("path");
const fs = require("fs-extra");
const chalk = require("chalk");
const cliRootDir = path.resolve(__dirname, "../../");
function createPackage(packageName) {
    if (!packageName) {
        return;
    }
    // 最终的packageName
    console.log(`lerna create ${packageName}`);
    const folderName = packageName;
    const ls = spawn("lerna", ["create", packageName], {
        shell: true,
        stdio: "inherit",
        cwd: process.cwd(),
    });
    ls.on("close", async code => {
        if (code === 0) {
            // 做一些修改
            const pkgFolder = `packages/${folderName}/`;
            const pkgFile = `${pkgFolder}package.json`;
            try {
                // 修改package.json
                console.log(chalk.green("nore: 初始化package.json"));
                const pkgContent = await fs.readJson(pkgFile);
                delete pkgContent.publishConfig;
                pkgContent.main = "dist/index.js";
                pkgContent.module = "dist/index.esm.js";
                pkgContent.files = ["dist"];
                if (!pkgContent.scripts) {
                    pkgContent.scripts = {};
                }
                pkgContent.scripts.build = "nore build";
                pkgContent.scripts.start = "nore start";
                await fs.writeJson(pkgFile, pkgContent, { EOL: "\n", spaces: 4 });

                // 复制模版到指定的文件夹
                console.log(chalk.green("nore: 复制模版到指定的文件夹"));
                const templateFolder = path.resolve(cliRootDir, "template/package/");
                await fs.copy(templateFolder, pkgFolder);
                // 安装cli
                console.log(chalk.green("nore: 安装 @nore/cli"));
                spawnSync("lerna", ["add", "@nore/cli", "--scope", "--dev", packageName], {
                    // shell: true,
                    // stdio: "inherit",
                    cwd: process.cwd(),
                });
                console.log(chalk.green("nore: 安装 core-js"));
                spawnSync("lerna", ["add", "core-js@3", "--scope", packageName], {
                    // shell: true,
                    // stdio: "inherit",
                    cwd: process.cwd(),
                });

                console.log(chalk.green("nore: 创建成功"));
            } catch (error) {
                console.error(error);
            }
        }
    });
}
module.exports = createPackage;
