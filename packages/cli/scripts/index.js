#!/usr/bin/env node

"use strict";

require("colorful").colorful();
const program = require("commander");

program.on("--help", () => {
    console.log("  Usage:".to.bold.blue.color);
});

program.parse(process.argv);

const task = program.args[0];

if (!task) {
    program.help();
} else {
    console.log("@norejs/cli run", task);

    if (task == "start") {
        require("./start");
    } else if (task == "build") {
        require("./build");
    } else if (task == "create") {
        require("./create")(program.args);
    } else if (task == "doc") {
        require("./doc");
    } else if (task == "apidoc") {
        require("./apidoc");
    } else {
        program.help();
    }
}
