const rollup = require("rollup");
const path = require("path");
const fs = require("fs-extra");
const babel = require("@rollup/plugin-babel").default;
const filesize = require("rollup-plugin-filesize");
const commonjs = require("@rollup/plugin-commonjs");
const deepMerge = require("../util/deepMerge");
const runSh = require("../util/runSh");
const rootPath = process.cwd();
const chalk = require("chalk");
const typescript = require("@rollup/plugin-typescript");
const sass = require("rollup-plugin-sass");

let projectConfig = {};
try {
    projectConfig = require(path.resolve(rootPath, "./nore.config.js")) || {};
} catch (error) {}
const { deepMerge: isDeepMerge = true } = projectConfig;
const mergeMethod = isDeepMerge ? deepMerge : Object.assign;

async function build(isDev = false) {
    /**是否启用ts */
    const isTypescript = await fs.exists(path.join(rootPath, "src/index.ts"));
    /**入口文件格式 */
    const fileFormat = isTypescript ? "ts" : "js";
    const tsPlugins = isTypescript
        ? [
              typescript({
                  compilerOptions: {
                      lib: ["es5", "es6", "dom"],
                      target: "es5",
                      allowSyntheticDefaultImports: true,
                      jsx: "react",
                  },
              }),
          ]
        : [];
    const defaultConfig = {
        input: {
            input: `src/index.${fileFormat}`,
            plugins: [
                commonjs(),
                filesize(),
                babel({
                    babelHelpers: "bundled",
                    exclude: ["node_modules/**"],
                }),
                sass({ insert: true }),
                ...tsPlugins,
            ],
            external: id => {
                const external = ["react"];
                return id.indexOf("@norejs/") > -1 || external.includes(id);
            },
        },
        output: [
            {
                dir: "dist",
                format: "cjs",
                entryFileNames: "[name].js",
                sourcemap: isDev,
                exports: "auto",
            },
            {
                dir: "dist/esm/",
                format: "esm",
                entryFileNames: "[name].js",
                sourcemap: isDev,
                exports: "auto",
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
