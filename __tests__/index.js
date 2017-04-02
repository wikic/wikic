jest.mock('fs-promise')
jest.mock('chokidar')
jest.mock('../lib/utils/server')
jest.mock('../lib/utils/log')
jest.mock('../lib/utils/getConfig')

const Wikic = require('../index')

test('has these properties', () => {
  const wikic = new Wikic()
  expect(wikic).toHaveProperty('root')
  expect(wikic).toHaveProperty('publicPath')
  expect(wikic).toHaveProperty('layoutPath')
  expect(wikic).toHaveProperty('docsPath')
  expect(wikic).toHaveProperty('config')
  expect(wikic).toHaveProperty('afterReadTasks')
  expect(wikic).toHaveProperty('beforeWriteTasks')
})

test('return this', () => {
  const wikic = new Wikic()
  const keys = ['clean', 'configureRenderer', 'setConfig', 'setup', 'watch', 'serve', 'setBaseURL']
  keys.forEach((key) => {
    expect(wikic[key]()).toBe(wikic)
  })
})
