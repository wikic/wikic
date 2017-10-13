const time = require('../time')

test('works', () => {
  expect(time(new Date(2010, 0, 1, 12, 30, 1))).toBe('12:30:01')
})
