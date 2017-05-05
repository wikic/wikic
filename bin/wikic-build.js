#! /usr/bin/env node

const program = require('commander');
const Wikic = require('..');
const logger = require('../lib/utils/log');

program
  .option('-c, --clean', 'clean public dir before building')
  .option('-w, --watch', 'watch src dir change')
  .option('-s, --serve', 'serve public dir')
  .option('-d, --dir <dir>', 'change working dir')
  .parse(process.argv);

const wikic = new Wikic(program.dir);

(async () => {
  try {
    if (program.clean) await wikic.clean();
    await wikic.build();
    if (program.watch) wikic.watch();
    if (program.serve) await wikic.serve();
  } catch (e) {
    logger.error(e);
  }
})();
