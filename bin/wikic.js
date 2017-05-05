#! /usr/bin/env node

/**
 * xcatliu/pagic(MIT): https://github.com/xcatliu/pagic/tree/master/bin/pagic.js
 */

const program = require('commander');
const pkg = require('../package.json');

program
  .version(pkg.version)
  .command('init <dir>', 'create a new Wikic folder')
  .command('build [options]', 'build static pages')
  .parse(process.argv);
