jest.mock('../utils/glob')
jest.mock('fs-promise')
jest.mock('chokidar')
jest.mock('../utils/glob')
jest.mock('../utils/server')
jest.mock('../utils/log')
jest.mock('../utils/getConfig')
jest.mock('../utils/renderer')
jest.mock('../plugins/addTOC')
jest.mock('../plugins/load')

const chokidar = require('chokidar')
const Wikic = require('../index')
const glob = require('../utils/glob')
const logger = require('../utils/log')
const fsp = require('fs-promise')

/* eslint-disable no-underscore-dangle */
glob.__setPath('**/*', ['404.md', 'styles/main.css'])
glob.__setPath('**/*.md', ['css/flexbox.md', 'html/hi.md'])
glob.__setPath('**/', ['css/', 'html/'])
/* eslint-enable no-underscore-dangle */

const callThat = (key, afterCalling) => {
  it(`calls ${key}`, async () => {
    const wikic = new Wikic()
    const spy = jest.spyOn(wikic, key)
    await wikic[afterCalling]()
    expect(spy).toHaveBeenCalled()
    spy.mockReset()
    spy.mockRestore()
  })
}

describe('wikic build', () => {
  describe('setup', () => {
    callThat('setConfig', 'setup')
  })

  describe('setConfig', () => {
    callThat('configureRenderer', 'setConfig')
  })

  describe('afterRead & beforeWrite', () => {
    it('beforeWrite works', async () => {
      const wikic = new Wikic()
      const callback = jest.fn(context => context)
      const length = wikic.beforeWriteTasks.length

      expect(wikic.beforeWrite(callback)).toBe(wikic)
      expect(wikic.beforeWriteTasks.length).toBe(length + 1)
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
      const length = wikic.afterReadTasks.length

      expect(wikic.afterRead(callback)).toBe(wikic)
      expect(wikic.afterReadTasks.length).toBe(length + 1)
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
      const wikic = new Wikic()
      wikic.build()
      wikic.build()
      expect(logger.error.mock.calls.length).toBe(1)
      logger.error.mockClear()
    })
  })

  describe('readMD', () => {
    it('works if with from in context', async () => {
      const wikic = new Wikic()
      await wikic.readMD({
        data: '',
        config: {},
      })
    })

    it('works if set skipRead and afterReadTasks', async () => {
      const wikic = new Wikic()
      await wikic.readMD({
        from: '/path/to/',
        data: '',
        config: {},
        afterReadTasks: [],
        skipRead: true,
      })
    })
  })
})

describe('watch', () => {
  /* eslint-disable  no-underscore-dangle */
  it('works', () => {
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
})
