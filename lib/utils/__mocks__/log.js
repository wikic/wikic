/* eslint-disable no-console */
const logger = jest.genMockFromModule('../log');

logger.transports = { file: {}, console: {} };
logger.error = jest.fn((...arg) => console.log(...arg));
logger.warn = jest.fn((...arg) => console.log(...arg));

module.exports = logger;
