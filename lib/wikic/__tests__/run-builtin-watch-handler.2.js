jest.mock('../builtin-watch-handlers', () => {
  const m = {
    setupAndBuild: jest.fn(() => false),
    build: jest.fn(() => false),
    buildStaticFile: jest.fn(() => false),
  }
  return m
})

const runHandler = require('../run-builtin-watch-handler')
const handlers = require('../builtin-watch-handlers')

const wikic = {}
const matchers = {
  setupAndBuild: '**/_config.yml',
  build: '*.md',
  buildStaticFile: '*.njk',
}

test('works', () => {
  const filePath = 'index.css'
  expect(runHandler(filePath, matchers, wikic)).toBe(false)
  expect(handlers.setupAndBuild).toBeCalledWith(filePath, wikic, matchers.setupAndBuild)
  expect(handlers.build).toBeCalledWith(filePath, wikic, matchers.build)
  expect(handlers.buildStaticFile).toBeCalledWith(filePath, wikic, matchers.buildStaticFile)
})
