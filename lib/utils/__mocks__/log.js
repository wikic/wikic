const logger = jest.genMockFromModule('../log')
// eslint-disable-next-line no-console
logger.error = jest.fn((...arg) => console.log(...arg))

module.exports = logger
