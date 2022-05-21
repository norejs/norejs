// 构建一个Package
const rollup = require("rollup");
const path = require("path");
const resolve = require("@rollup/plugin-node-resolve").default;
const babel = require("@rollup/plugin-babel").default;
const filesize = require("rollup-plugin-filesize");
const commonjs = require("@rollup/plugin-commonjs");
const deepMerge = require("../util/deepMerge");
const runSh = require("../util/runSh");
const rootPath = process.cwd();
const chalk = require("chalk");
const preset = require("@babel/preset-env");
let projectConfig = {};

try {
    projectConfig = require(path.resolve(rootPath, "./nore.config.js")) || {};
} catch (error) {}
const { deepMerge: isDeepMerge = true } = projectConfig;
const mergeMethod = isDeepMerge ? deepMerge : Object.assign;

async function build(isDev = false) {
    const defaultConfig = {
        input: {
            input: "src/index.js",
            plugins: [
                resolve(),
                commonjs(),
                filesize(),
                babel({
                    babelHelpers: "bundled",
                    presets: [preset],
                    exclude: ["node_modules/**"],
                }),
            ],
            external: id => {
                return id.indexOf("@norejs/") > -1;
            },
        },
        output: [
            {
                dir: "dist",
                format: "cjs",
                entryFileNames: "[name].js",
                sourcemap: isDev,
            },
            {
                dir: "dist/esm/",
                format: "esm",
                entryFileNames: "[name].js",
                sourcemap: isDev,
            },
        ],
    };
    const config =
        typeof projectConfig === "function"
            ? projectConfig(defaultConfig)
            : mergeMethod(defaultConfig, projectConfig || {});

    // create a bundle
    const { input, output, watch, ...otherProps } = config;
    if (isDev) {
        const watcher = rollup.watch({
            ...input,
            output,
            ...otherProps,
            watch,
        });
        watcher.on("event", event => {
            // console.log(event);
            switch (event.code) {
                case "END":
                    const cliDir = path.resolve(__dirname, "../../");
                    const packageDir = path.relative(cliDir, rootPath);
                    console.log(chalk.green("auto publish to yalc "));
                    runSh("yalc publish " + packageDir, { cwd: cliDir }, (err, stdout, stderr) => {
                        stdout && console.log(chalk.green("yalc:"), stdout);
                        stderr && console.log(stderr);
                    });
                    break;
            }
        });
        // 完成后运行yalc
    } else {
        const bundle = await rollup.rollup(input);
        if (Array.isArray(output)) {
            output.map(async item => {
                await bundle.write(item);
            });
        } else {
            await bundle.write(output);
        }
    }
}

module.exports = build;
