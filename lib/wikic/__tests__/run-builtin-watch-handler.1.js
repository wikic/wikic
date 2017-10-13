jest.mock('../builtin-watch-handlers', () => {
  const m = {
    setupAndBuild: jest.fn(() => false),
    build: jest.fn(),
    buildStaticFile: jest.fn(),
  }
  return m
})

const runHandler = require('../run-builtin-watch-handler')
const handlers = require('../builtin-watch-handlers')

const wikic = {}
const matchers = {
  setupAndBuild: '**/_config.yml',
  build: '*.md',
  buildStaticFile: '**/*',
}

test('works', () => {
  expect(runHandler('index.md', matchers, wikic)).not.toBe(false)
  expect(handlers.setupAndBuild).toBeCalledWith('index.md', wikic, matchers.setupAndBuild)
  expect(handlers.build).toBeCalledWith('index.md', wikic, matchers.build)
  expect(handlers.buildStaticFile).not.toBeCalled()
})
