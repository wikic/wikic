jest.mock('chokidar')
jest.mock('../../utils/log')
jest.mock('../../utils/get-config')
jest.mock('../run-builtin-watch-handler', () => jest.fn(() => false))
jest.mock('../run-custom-watch-handler', () => jest.fn(() => false))

const Wikic = require('..')
const logger = require('../../utils/log')
const chokidar = require('chokidar')
const runBuiltInWatchHandler = require('../run-builtin-watch-handler')
const runCustomWatchHandler = require('../run-custom-watch-handler')

test('nothing to do', () => {
  const wikic = new Wikic()

  expect(wikic.watch()).toBe(wikic)
  expect(logger.verbose).not.toBeCalled()

  chokidar.__emiter.emit('change', 'index.md')
  expect(runBuiltInWatchHandler).toBeCalled()
  expect(runCustomWatchHandler).toBeCalled()

  expect(logger.verbose).toBeCalled()
  expect(logger.error).not.toBeCalled()

  chokidar.__emiter.emit('error', 'error')
  expect(logger.error).toBeCalled()
})
