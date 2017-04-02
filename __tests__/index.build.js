jest.mock('../lib/utils/glob')
jest.mock('fs-promise')
jest.mock('chokidar')
jest.mock('../lib/utils/glob')
jest.mock('../lib/utils/server')
jest.mock('../lib/utils/log')
jest.mock('../lib/utils/getConfig')
jest.mock('../lib/utils/renderer')
jest.mock('../lib/plugins/addTOC')
jest.mock('../lib/plugins/load')

const logger = require('../lib/utils/log')
const Wikic = require('../index')
const glob = require('../lib/utils/glob')

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

describe('setup', () => {
  callThat('setBaseURL', 'setup')
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
  callThat('clean', 'build')
  callThat('buildStaticFiles', 'build')
  callThat('buildDocs', 'build')

  it('should not call buildIndex if this.config.overwriteIndex is false', async () => {
    const wikic = new Wikic()
    const spy = jest.spyOn(wikic, 'buildIndex')
    wikic.config.overwriteIndex = false
    await wikic.build()
    expect(spy).not.toHaveBeenCalled()
    spy.mockReset()
    spy.mockRestore()
  })

  it('should call buildIndex if this.config.overwriteIndex is true', async () => {
    const wikic = new Wikic()
    const spy = jest.spyOn(wikic, 'buildIndex')
    await wikic.build()

    expect(spy).toHaveBeenCalled()
    spy.mockReset()
    spy.mockRestore()
  })
})

describe('buildDocs', () => {
  callThat('buildMD', 'buildDocs')
})

describe('buildIndex', () => {
  it('throws if not run buildDocs first', async () => {
    const wikic = new Wikic()
    try {
      await wikic.buildIndex()
    } catch (e) {
      expect(e.message).toBe('require run buildDocs first.')
    }
  })

  it('throws if cannot find indexLayout in config', async () => {
    const wikic = new Wikic()
    wikic.config.indexLayout = ''
    await wikic.buildDocs()
    await wikic.buildIndex()
    expect(logger.error.mock.calls[0][0].message).toBe('should set `indexLayout` in _config.json')
    logger.error.mockClear()
  })
})
