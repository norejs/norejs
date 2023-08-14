#!/usr/bin/env node
"use strict";
require("colorful").colorful();
const program = require("commander");
program
    .command("start")
    .option("--version <version>", "start version")
    .action((options, command) => {
        require("./start")(options);
    });
program
    .command("build")
    .option("--version <version>", "start version")
    .action((options, command) => {
        require("./build")(options);
    });
program.command("create").action((options, command) => {
    require("./create")(program.args);
});
program
    .command("publish")
    .option("-r, --registry <registry>", "publish registry")
    .action((options, command) => {
        require("./publish")(options);
    });

program.parse(process.argv);
