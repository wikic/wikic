/* eslint-disable no-underscore-dangle */

jest.mock('fs-promise')
jest.mock('chokidar')
jest.mock('nunjucks')

jest.mock('../utils/glob')
jest.mock('../utils/server')
jest.mock('../utils/log')
jest.mock('../utils/getConfig')
jest.mock('../plugins/addTOC')
jest.mock('../plugins/load')
jest.mock('../utils/getList')

const chokidar = require('chokidar')
const Wikic = require('../index')
const glob = require('../utils/glob')
const logger = require('../utils/log')
const fsp = require('fs-promise')

glob.__setPath('**/*', ['404.md', 'styles/main.css'])
glob.__setPath('**/*.md', ['css/flexbox.md', 'html/hi.md'])
glob.__setPath('**/', ['css/', 'html/'])

describe('wikic build', () => {
  describe('afterRead & beforeWrite', () => {
    it('beforeWrite works', async () => {
      const wikic = new Wikic()
      const callback = jest.fn(context => context)
      const length = wikic._beforeWriteTasks.length

      expect(wikic.beforeWrite(callback)).toBe(wikic)
      expect(wikic._beforeWriteTasks.length).toBe(length + 1)
      await wikic.build()
      expect(callback.mock.calls.length).not.toBeLessThan(1)
    })

    it('beforeWrite throws if not pass a function', () => {
      const wikic = new Wikic()
      try {
        wikic.beforeWrite()
      } catch (e) {
        expect(e.message).toBe('should pass a function')
      }
    })

    it('afterRead works', async () => {
      const wikic = new Wikic()
      const callback = jest.fn(context => context)
      const length = wikic._afterReadTasks.length

      expect(wikic.afterRead(callback)).toBe(wikic)
      expect(wikic._afterReadTasks.length).toBe(length + 1)
      await wikic.build()
      expect(callback.mock.calls.length).not.toBeLessThan(1)
    })

    it('afterRead throws if not pass a function', () => {
      const wikic = new Wikic()
      try {
        wikic.afterRead()
      } catch (e) {
        expect(e.message).toBe('should pass a function')
      }
    })
  })

  describe('build', () => {
    it('call build() will call once only', () => {
      logger.error.mockClear()
      const wikic = new Wikic()
      wikic.build()
      wikic.build()
      expect(logger.error.mock.calls.length).toBe(1)
    })
  })

  describe('readMD', () => {
    it('works if src not in context', async () => {
      const wikic = new Wikic()
      await wikic.readMD({
        data: '',
        site: {},
      })
    })
  })
})

describe('watch', () => {
  it('works', () => {
    logger.error.mockClear()
    const wikic = new Wikic()
    wikic.watch()
    const setup = jest.spyOn(wikic, 'setup')
    const build = jest.spyOn(wikic, 'build')

    chokidar.__emiter.emit('change', '/path/to/')
    expect(setup).toHaveBeenCalled()
    expect(build).toHaveBeenCalled()
    setup.mockReset()
    setup.mockRestore()
    build.mockReset()
    build.mockRestore()

    chokidar.__emiter.emit('unlink', 'text.txt')
    expect(fsp.removeSync.mock.calls[0][0]).toMatch('docs/text.txt')

    chokidar.__emiter.emit('error', Error('oops'))
    expect(logger.error.mock.calls.length).toBe(1)
    expect(logger.error.mock.calls[0][0]).toMatch('Error: oops')
  })

  test('ignored', () => {
    const wikic = new Wikic()

    chokidar.watch.mockClear()
    wikic.config.layoutPath = '_layout'
    wikic.config.docsPath = '_doc'
    wikic.watch()
    expect(chokidar.watch.mock.calls[0][1].ignored.pop()).toBe('_!(layout|doc)/**')

    chokidar.watch.mockClear()
    wikic.config.layoutPath = 'layout'
    wikic.config.docsPath = 'doc'
    wikic.watch()
    expect(chokidar.watch.mock.calls[0][1].ignored.pop()).toBe('_*/**')
  })
})

describe('clean', async () => {
  const wikic = new Wikic()
  expect(await wikic.clean()).toBe(wikic)
  expect(fsp.emptyDir.mock.calls[0][0]).toBe(wikic.publicPath)
})
