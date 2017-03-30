const capitalize = require('../capitalize')

it('works', () => {
  expect(capitalize('abc c')).toBe('Abc c')
  expect(capitalize('Abc c')).toBe('Abc c')
  expect(capitalize('123abc')).toBe('123abc')
  expect(capitalize('')).toBe('')
  expect(capitalize).toThrow()
  expect(capitalize.bind(null, {})).toThrow()
})
