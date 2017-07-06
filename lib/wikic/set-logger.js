const logger = require('../utils/log');

module.exports = (wikic) => {
  if (!wikic.config.logger) return;
  const { console, file } = wikic.config.logger;
  logger.transports.console.level = console;
  logger.transports.file.level = file;
};
