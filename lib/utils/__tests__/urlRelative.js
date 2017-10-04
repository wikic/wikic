const relative = require('../urlRelative')
/* test from https://github.com/js-n/url-relative */

test('different domain', () => {
  expect(relative('http://a.com:12/a', 'http://b.com/a')).toBe('http://b.com/a')
})

test('same domain', () => {
  expect(relative('http://a.com/a', 'http://a.com/b')).toBe('b')
})

test('divergent paths, longer from', () => {
  expect(relative('/a/b/c/d', '/a/b/d')).toBe('../d')
  expect(relative('/a/b/c/d/e', '/a/d/e')).toBe('../../../d/e')
})

test('divergent paths, longer to', () => {
  expect(relative('/a/b/c/d', '/a/b/c/d/e')).toBe('e')
  expect(relative('/a/b/c/d', '/a/b/c/d/e/f')).toBe('e/f')
  expect(relative('/', '/a/b')).toBe('a/b')
})

test('divergent paths, equal length', () => {
  expect(relative('/a/b/c/d/e/f', '/a/b/c/g/h/j')).toBe('../../g/h/j')
})

test('trim /', () => {
  expect(relative('/a/b/c/d/e/f/', '/a/b/c/g/h/j')).toBe('../../g/h/j')
  expect(relative('/a/b/c/d/e/f/', '/a/b/c/g/h/j/')).toBe('../../g/h/j')
  expect(relative('/a/b/c/d/e/f', '/a/b/c/g/h/j/')).toBe('../../g/h/j')
})

test('not absolute', () => {
  expect(relative('a/b/c', '/a/b/')).toBe('/a/b/')
  expect(relative('/a/b/c', 'a/b/')).toBe('a/b/')
  expect(relative('a/b/c', 'a/b/c')).toBe('a/b/c')
})
