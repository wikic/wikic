#! /usr/bin/env node

const program = require('commander')
const Wikic = require('..')
const path = require('path')
const logger = require('../lib/utils/log')

program
  .option('-c, --clean', 'clean public dir before building')
  .option('-w, --watch', 'watch src dir change')
  .option('-s, --serve', 'serve public dir')
  .option('-d, --dir <dir>', 'change working dir')
  .option('-o, --output <dir>', 'change public dir')
  .option('-p, --port <number>', 'change server port')
  .parse(process.argv)
;(async () => {
  const config = {}
  if (program.output) config.publicPath = path.resolve(program.output)
  if (program.port) config.port = parseInt(program.port, 10)

  const wikic = new Wikic(program.dir, config)
  try {
    if (program.clean) await wikic.clean()
    await wikic.build()
    if (program.watch) wikic.watch()
    if (program.serve) await wikic.serve()
  } catch (e) {
    logger.error(e)
  }
})()
