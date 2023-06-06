const rollup = require('rollup');
const path = require('path');
const fs = require('fs-extra');
const babel = require('@rollup/plugin-babel').default;
const filesize = require('rollup-plugin-filesize');
const commonjs = require('@rollup/plugin-commonjs');
const deepMerge = require('../../util/deepMerge');
const runSh = require('../../util/runSh');
const rootPath = process.cwd();
const chalk = require('chalk');
const typescript = require('@rollup/plugin-typescript');
const { nodeResolve } = require('@rollup/plugin-node-resolve');
const { terser } = require('rollup-plugin-terser');
const babelEnv = require('@babel/preset-env');
let projectConfig = {};

const noreConfig = path.resolve(rootPath, './nore.config.js');
if (fs.existsSync(noreConfig)) {
    projectConfig = require(path.resolve(rootPath, './nore.config.js')) || {};
}

const { deepMerge: isDeepMerge = true } = projectConfig;
const mergeMethod = isDeepMerge ? deepMerge : Object.assign;
const babelConfig = {
    babelHelpers: 'bundled',
    exclude: ['node_modules/**', '../../node_modules/core-js/**'],
    presets: [
        [
            babelEnv,
            {
                useBuiltIns: 'usage',
                corejs: '3',
                targets: ['android >= 4.0', 'safari >= 9'],
            },
        ],
    ],
};
async function build(isDev = false) {
    const pkgName = path.basename(rootPath);
    const outputName = pkgName.toLocaleUpperCase().replace(/\-\_/, '');
    /**是否启用ts */
    const isTypescript = await fs.exists(path.join(rootPath, 'src/index.ts'));
    console.log(pkgName, isTypescript);
    /**入口文件格式 */
    const fileFormat = isTypescript ? 'ts' : 'js';
    const tsConfigFile = path.join(rootPath, 'tsconfig.json');
    const hasTsConfig = await fs.exists(tsConfigFile);
    const tsPluginOptions = typescript({
        tsconfig: hasTsConfig ? tsConfigFile : undefined,
        compilerOptions: {
            allowJs: true,
            checkJs: false,
            lib: ['es5', 'es6', 'dom', 'esnext'],
            target: 'es5',
            allowSyntheticDefaultImports: true,
            jsx: 'react',
        },
    });
    const { ...otherTsPluginOptions } = tsPluginOptions;
    const tsPlugins = isTypescript
        ? [
              {
                  ...otherTsPluginOptions,
              },
          ]
        : [];
    const outputPlugins = [];
    if (!isDev) {
        outputPlugins.push(terser());
    }
    const defaultConfig = {
        input: {
            input: `src/index.${fileFormat}`,
            plugins: [
                nodeResolve(),
                commonjs(),
                filesize(),
                babel(babelConfig),
                ...tsPlugins,
            ],
            external: (id) => {
                const external = ['react'];
                const isCoreJs = id.indexOf('core-js') === 0;
                return external.includes(id) || isCoreJs;
            },
            onwarn: function (warning) {
                console.warn('warning', warning);
            },
        },
        output: [
            {
                dir: 'dist',
                format: 'esm',
                entryFileNames: '[name].esm.js',
                sourcemap: isDev,
                exports: 'named',
                plugins: outputPlugins,
            },
            {
                dir: 'dist',
                format: 'cjs',
                entryFileNames: '[name].js',
                sourcemap: isDev,
                exports: 'auto',
                plugins: outputPlugins,
            },
        ],
    };

    // create a bundle
    const umdConfig = {
        input: {
            input: `src/index.${fileFormat}`,
            plugins: [
                nodeResolve(),
                commonjs(),
                filesize(),
                babel({
                    ...babelConfig,
                    exclude: [
                        'node_modules/**',
                        '../../node_modules/core-js/**',
                        /.*node_modules\/.*/,
                    ],
                }),
                ...tsPlugins,
            ],
            external: (id) => {
                const external = ['react'];
                return external.includes(id);
            },
            onwarn: function (warning) {
                console.warn('warning', warning);
            },
        },
        output: [
            {
                dir: 'dist',
                format: 'umd',
                entryFileNames: 'serve/[name].umd.js',
                sourcemap: isDev,
                exports: 'named',
                name: 'NORE_' + outputName,
                plugins: outputPlugins,
            },
        ],
    };
    const config =
        typeof projectConfig === 'function'
            ? projectConfig(defaultConfig, { isDev, umdConfig, defaultConfig })
            : mergeMethod(defaultConfig, projectConfig || {});
    const configList = Array.isArray(config) ? config : [config];
    configList.map(async (config) => {
        const {
            input,
            output,
            watch,
            babel: customBabelConfig = null,
            ...otherProps
        } = config || {};
        if (typeof customBabelConfig === 'object') {
            input.plugins = input.plugins.map((item) => {
                if (item.name === 'babel') {
                    return babel({ ...babelConfig, ...customBabelConfig });
                }
                return item;
            });
        }
        if (!input || !output) {
            return;
        }
        if (isDev) {
            const watcher = rollup.watch({
                ...input,
                output,
                ...otherProps,
                watch,
            });
            watcher.on('event', (event) => {
                switch (event.code) {
                    case 'END':
                        const cliDir = path.resolve(__dirname, '../../');
                        const packageDir = path.relative(cliDir, rootPath);
                        console.log(chalk.green('auto publish to yalc '));
                        runSh(
                            'yalc publish ' + packageDir + ' --update',
                            null,
                            { cwd: cliDir }
                        );
                        break;
                    case 'ERROR':
                        throw new Error(event.error);
                }
            });
            // 完成后运行yalc
        } else {
            try {
                const bundle = await rollup.rollup(input);
                if (Array.isArray(output)) {
                    output.map(async (item) => {
                        await bundle.write(item);
                    });
                } else {
                    await bundle.write(output);
                }
                if (bundle) {
                    await bundle.close();
                }
            } catch (e) {
                console.log('bundle error', e);
            }
        }
    });
}

module.exports = build;
