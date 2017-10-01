jest.mock('../../utils/log')
jest.mock('../../utils/get-config', () => () => ({
  root: '.',
  docsPath: '_note',
  title: 'Wikic Demo',
  baseurl: 'wikic',
  layoutPath: '_layouts',
  publicPath: '../docs',
  page: {
    layout: 'default',
    toc: true,
  },
  suites: [],
}))

const Wikic = require('..')
const logger = require('../../utils/log')

describe('serve', () => {
  beforeEach(() => {
    logger.error.mockClear()
  })

  it('logs error if config.server not found', () => {
    const wikic = new Wikic()
    wikic.serve()
    expect(logger.error.mock.calls.length).toBe(1)
  })

  it('logs error if config.server is not a function', () => {
    const wikic = new Wikic(null, { server: 'something' })
    wikic.serve()
    expect(logger.error.mock.calls.length).toBe(1)
  })

  it('calls a function and returns what server returns', () => {
    const server = jest.fn(() => 'something')
    const wikic = new Wikic(null, {
      server,
    })
    expect(wikic.serve()).toBe('something')
    expect(server).toBeCalledWith(
      expect.objectContaining({ root: '.' }),
      expect.stringMatching(/docs$/)
    )
    expect(logger.error.mock.calls.length).toBe(0)
  })
})
