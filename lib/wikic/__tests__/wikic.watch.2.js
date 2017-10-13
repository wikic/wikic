jest.mock('chokidar')
jest.mock('../../utils/log')
jest.mock('../../utils/get-config')
jest.mock('../run-builtin-watch-handler', () => jest.fn(() => false))
jest.mock('../run-custom-watch-handler')

const Wikic = require('..')
const chokidar = require('chokidar')
const runBuiltInWatchHandler = require('../run-builtin-watch-handler')
const runCustomWatchHandler = require('../run-custom-watch-handler')

test('returns if runCustomWatchHandler does not return false', () => {
  const wikic = new Wikic()

  expect(wikic.watch()).toBe(wikic)

  chokidar.__emiter.emit('change', 'index.md')
  expect(runBuiltInWatchHandler).toBeCalled()
  expect(runCustomWatchHandler).toBeCalled()
})
