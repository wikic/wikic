#! /usr/bin/env node

const path = require('path');
const fsp = require('fs-promise');
const program = require('commander');
const logger = require('../lib/utils/log');

let initDir;

program
  .arguments('<dir>')
  .action((dir) => {
    initDir = dir;
  })
  .parse(process.argv);

if (typeof initDir === 'undefined') {
  logger.error('You must specify a dir');
  process.exit(1);
}

if (fsp.existsSync(initDir)) {
  logger.error(`${initDir} already exists`);
  process.exit(1);
}

const copySrcDir = path.resolve(__dirname, '../site');
initDir = path.resolve(initDir);
fsp.copySync(copySrcDir, initDir);

logger.verbose(
  `Init ${initDir} done
Please \`cd ${initDir}\` and run \`wikic build\``
);
