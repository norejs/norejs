'use strict';

const { runSh } = require('../dist/index.js');
runSh('npm run test', {}, (code, data) => {
    console.log(data);
});
