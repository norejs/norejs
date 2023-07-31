# @nore-js/cli


## @norejs/cli - A Minimalist JS Package Building Tool

If you want to develop a JS package, `nore-cli` can save you from the hassle of configuring `rollup`, `babel`, `eslint`, and more.

## Main Features:
* TypeScript Support
* JSX and TSX Support
* React Component Development Support
* Sass Support
* Export as ES Modules (ESM) and CommonJS (CJS)
* Support for Configuring Extension Features
* Support for Local Debugging with `yalc`

# Usage
## Installation
```bash
npm i @norejs/cli
```
## Project Directory
You need to manually create the following directory structure:
```bash
├── src
│   ├── index.ts # Entry file
├── package.json
```

## Modify package.json
``` json
{
  // ...
  "main": "dist/index.js",
  "module": "dist/index.esm.js",
  "scripts": {
    "start": "nore start",
    "build": "nore build"
  }
  // ...
}
```
## Development
```bash
npm start
```
After running, it will automatically monitor the changes of files in the `src` directory. When the files change, it will automatically rebuild and publish to the local repository of `yalc`. You can use the `yalc link` command to link the local repository package to your project for debugging.

## Build
```bash
npm run build
```

## Configuration
If you want to customize the configuration, you can create a `nore.config.js` file in the root directory of the project. The configuration items are as follows:
``` javascript
// nore.config.js
module.exports = function rollupConfig(config, options) {
    // config is the current rollup configuration, modify it here and return a new config
    return config;
};
```


----
## @norejs/cli 极简的 JS package 构建工具

如果你想开发一个 JS package, @nore/cli 可以帮你省去rollup、babel、eslint 等配置的烦恼
## 主要包含以下功能：
* 支持 typescript
* 支持 jsx、tsx
* 支持 react 组件开发
* 支持 sass
* 支持导出 ESM、CJS
* 支持配置扩展功能
* 支持 yalc 本地调试

# 使用
## 安装
```bash
npm i @norejs/cli
```

## 项目目录
需要手动创建目录结构，目录结构如下：

```bash
├── src
│   ├── index.ts # 入口文件
├── package.json
```

## 修改 package.json
```json
{
  // ...
  "main": "dist/index.js",
  "module": "dist/index.esm.js",
  "scripts": {
    "start": "nore start",
    "build": "nore build"
  }
  // ...
}
```

## 开发
```bash
npm start
```
运行后，会自动监听 src 目录下的文件变化，当文件变化时，会自动重新构建，同时会自动发布至 yalc 本地仓库, 你可以使用 yalc link 命令将本地仓库的包链接到你的项目中进行调试

## 构建
```bash
npm run build
```

## 配置
如果你想自定义配置，可以在项目根目录下创建 nore.config.js 文件，配置项如下：
``` javascript
// nore.config.js
module.exports = function rollupConfig(config, options) {
    // config 是当前正在使用的rollup配置，在这里修改后返回一个新的config
    return config;
};
```



