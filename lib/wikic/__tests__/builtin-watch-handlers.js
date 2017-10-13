jest.mock('../get-static-ignored', () => () => ['docs/**'])

const wikic = {
  setup: jest.fn(() => wikic),
  build: jest.fn(() => Promise.resolve()),
  buildStaticFile: jest.fn(() => Promise.resolve()),
  config: {},
  filter: {
    exec: jest.fn(() => Promise.resolve()),
  },
}

const handlers = require('../builtin-watch-handlers')

test('handlers.build', () => {
  expect(handlers.build('aindex.md', wikic, 'index.md')).toBe(false)
  expect(wikic.build).not.toBeCalled()

  expect(handlers.build('index.md', wikic, 'index.md')).not.toBe(false)
  expect(wikic.build).toBeCalled()
})

test('handlers.setupAndBuild', () => {
  wikic.build.mockClear()
  expect(handlers.setupAndBuild('aindex.md', wikic, 'index.md')).toBe(false)
  expect(wikic.setup).not.toBeCalled()
  expect(wikic.build).not.toBeCalled()

  expect(handlers.setupAndBuild('index.md', wikic, 'index.md')).not.toBe(false)
  expect(wikic.setup).toBeCalled()
  expect(wikic.build).toBeCalled()
})

test('handlers.buildStaticFile', async () => {
  expect(handlers.buildStaticFile('docs/index.md', wikic, '**/*')).toBe(false)
  expect(wikic.buildStaticFile).not.toBeCalled()
  expect(wikic.filter.exec).not.toBeCalled()

  const ret = await handlers.buildStaticFile('index.md', wikic, '**/*')
  expect(ret).not.toBe(false)
  expect(wikic.buildStaticFile).toBeCalled()
  expect(wikic.filter.exec).toBeCalled()
})
