jest.mock('fs-promise')
jest.mock('chokidar')
jest.mock('../utils/server')
jest.mock('../utils/log')
jest.mock('../utils/getConfig')

const Wikic = require('../index')
const server = require('../utils/server')

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
  const keys = ['configureRenderer', 'setConfig', 'setup', 'watch', 'serve']
  keys.forEach((key) => {
    expect(wikic[key]()).toBe(wikic)
  })
})

describe('serve', () => {
  const wikic = new Wikic()
  wikic.serve()
  const { port, getCwd, getBaseurl } = server.create.mock.calls[0][0]
  expect(port).toBe(wikic.config.port)
  expect(getBaseurl()).toBe(wikic.config.baseurl)
  expect(getCwd()).toBe(wikic.publicPath)
})
