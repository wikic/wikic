jest.mock('chokidar', () => require('../../../mocks/chokidar'))
jest.mock('../../utils/log')
jest.mock('../../utils/get-config', () => require('../../../mocks/get-config'))

beforeEach(() => {
  jest.resetModules()
})

test('returns if runBuiltInWatchHandler does not return false', () => {
  jest.doMock('../run-builtin-watch-handler')
  jest.doMock('../run-custom-watch-handler')
  const Wikic = require('..')
  const chokidar = require('chokidar')
  const wikic = new Wikic()
  const runBuiltInWatchHandler = require('../run-builtin-watch-handler')
  const runCustomWatchHandler = require('../run-custom-watch-handler')
  expect(wikic.watch()).toBe(wikic)
  chokidar.__emiter.emit('change', 'index.md')
  expect(runBuiltInWatchHandler).toBeCalled()
  expect(runCustomWatchHandler).not.toBeCalled()
})

test('returns if runCustomWatchHandler does not return false', () => {
  jest.doMock('../run-builtin-watch-handler', () => jest.fn(() => false))
  jest.doMock('../run-custom-watch-handler')
  const Wikic = require('..')
  const chokidar = require('chokidar')
  const wikic = new Wikic()
  const runBuiltInWatchHandler = require('../run-builtin-watch-handler')
  const runCustomWatchHandler = require('../run-custom-watch-handler')
  expect(wikic.watch()).toBe(wikic)
  chokidar.__emiter.emit('change', 'index.md')
  expect(runBuiltInWatchHandler).toBeCalled()
  expect(runCustomWatchHandler).toBeCalled()
})

test('nothing to do', () => {
  jest.doMock('../run-builtin-watch-handler', () => jest.fn(() => false))
  jest.doMock('../run-custom-watch-handler', () => jest.fn(() => false))
  const Wikic = require('..')
  const chokidar = require('chokidar')
  const logger = require('../../utils/log')
  const runBuiltInWatchHandler = require('../run-builtin-watch-handler')
  const runCustomWatchHandler = require('../run-custom-watch-handler')

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
