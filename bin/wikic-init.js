#! /usr/bin/env node

/**
 * xcatliu/pagic(MIT): https://github.com/xcatliu/pagic/tree/master/bin/pagic-init.js
 */

const path = require('path')
const fse = require('fs-extra')
const program = require('commander')
const logger = require('../lib/utils/log')

let initDir

program
  .arguments('<dir>')
  .action((dir) => {
    initDir = dir
  })
  .parse(process.argv)

if (typeof initDir === 'undefined') {
  logger.error('You must specify a dir')
  process.exit(1)
}

if (fse.existsSync(initDir)) {
  logger.error(`${initDir} already exists`)
  process.exit(1)
}

const copySrcDir = path.resolve(__dirname, '../example')

initDir = path.resolve(initDir)
fse.copySync(copySrcDir, initDir)

logger.verbose(
  `Init ${initDir} done
Please \`cd ${initDir}\` and run \`wikic build\``
)
