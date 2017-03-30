const typeLink = require('../typeLink')

test('typeLink', () => {
  const url = '/123.html'
  const value = '123.com'
  expect(typeLink({ url, value })).toMatch(/<a.* href="\/123.html".*>123\.com<\/a>/)
})
