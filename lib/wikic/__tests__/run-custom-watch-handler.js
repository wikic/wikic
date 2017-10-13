const runHandler = require('../run-custom-watch-handler')

jest.mock('../../utils/log')

const wikic = {}

test('not run next handler if the previous returns non-false', () => {
  const handler1 = jest.fn()
  const handler2 = jest.fn()
  const matcher = ['**/*.md']
  const handlers = {
    b: {
      matcher,
      handler: handler1,
    },
    a: {
      matcher,
      handler: handler2,
    },
  }
  const filePath = '_notes/h.md'
  expect(runHandler(filePath, handlers, wikic)).not.toBe(false)
  expect(handler1).toBeCalledWith(filePath, wikic)
  expect(handler2).not.toBeCalled()
})

test('run next handler if the previous returns false', () => {
  const handler1 = jest.fn(() => false)
  const handler2 = jest.fn()
  const matcher = ['**/*.md']
  const handlers = {
    b: {
      matcher,
      handler: handler1,
    },
    a: {
      matcher,
      handler: handler2,
    },
  }
  const filePath = '_notes/h.md'
  expect(runHandler(filePath, handlers, wikic)).not.toBe(false)
  expect(handler1).toBeCalledWith(filePath, wikic)
  expect(handler2).toBeCalledWith(filePath, wikic)
})

test('not call handler if not matched', () => {
  const handler1 = jest.fn()
  const handler2 = jest.fn()
  const handlers = {
    b: {
      matcher: 'sw.js',
      handler: handler1,
    },
    a: {
      matcher: ['**/*.md'],
      handler: handler2,
    },
  }
  const filePath = '_notes/h.md'
  expect(runHandler(filePath, handlers, wikic)).not.toBe(false)
  expect(handler1).not.toBeCalled()
  expect(handler2).toBeCalledWith(filePath, wikic)
})

test('throws if handler is not a function', () => {
  const handlers = {
    b: {
      matcher: '**/*.md',
      handler: 'any',
    },
  }
  const filePath = '_notes/h.md'
  expect(() => {
    runHandler(filePath, handlers, wikic)
  }).toThrow()
})

test('returns false if not matched any', () => {
  const handler1 = jest.fn()
  const handler2 = jest.fn()
  const handlers = {
    b: {
      matcher: 'sw.js',
      handler: handler1,
    },
    a: {
      matcher: ['**/*.njk'],
      handler: handler2,
    },
  }
  expect(runHandler('_notes/h.md', handlers, wikic)).toBe(false)
  expect(handler1).not.toBeCalled()
  expect(handler2).not.toBeCalled()
})

test('returns false if handlers is not a object', () => {
  expect(runHandler('_notes/h.md', '', wikic)).toBe(false)
  expect(runHandler('_notes/h.md', null, wikic)).toBe(false)
})
