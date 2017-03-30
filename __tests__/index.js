const Wikic = require('../index')

jest.mock('fs-promise')
jest.mock('../lib/utils/glob')
// jest.mock('../lib/utils/findParentDir')
jest.mock('../lib/utils/server', () => () => true)
jest.mock('../lib/plugins/addTOC', () => context => context)
jest.mock('../lib/plugins/load', () => context => Promise.resolve(context))
jest.mock('../lib/utils/getConfig', () => () => ({
  root: '.',
  docsPath: '_note',
  title: 'Wikic Demo',
  layout: 'default',
  overwriteIndex: true,
  indexLayout: 'index',
  baseurl: 'wikic',
  port: 4500,
  layoutPath: '_layouts',
  publicPath: '../docs',
  excludes: [
    'gulpfile.js',
    'index.js',
    'yarn.lock',
    'package.json',
    '**/node_modules/**',
  ],
  typeMap: {
    css: 'CSS',
    frontend: 'FrontEnd',
    webapi: 'Web API',
    html: 'HTML',
    ecmascript: 'ECMAScript',
    '.': 'Home',
  },
}))

jest.mock('../lib/utils/renderer', () => ({
  configure() {
    return undefined
  },

  render() {
    return undefined
  },

  env: {
    addGlobal() {
      return undefined
    },

    addFilter() {
      return undefined
    },
  },
}))
const glob = require('../lib/utils/glob')

/* eslint-disable no-underscore-dangle */
glob.__setPath('**/*', ['404.md', 'styles/main.css'])
glob.__setPath('**/*.md', ['css/flexbox.md', 'html/hi.md'])
glob.__setPath('**/', ['css/', 'html/'])
/* eslint-enable no-underscore-dangle */

jest.mock('chokidar', () => {
  const watch = () => ({
    on() {
      return watch()
    },
  })
  return { watch }
})

test('works', () => {
  const wikic = new Wikic()
  expect(wikic).toBeInstanceOf(Wikic)
})

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

describe('beforeWrite', () => {
  it('works', async () => {
    const wikic = new Wikic()
    const callback = jest.fn(context => context)
    const length = wikic.beforeWriteTasks.length

    expect(wikic.beforeWrite(callback)).toBe(wikic)
    expect(wikic.beforeWriteTasks.length).toBe(length + 1)
    await wikic.build()
    expect(callback.mock.calls.length).not.toBeLessThan(1)
  })

  it('throws if not pass a function', () => {
    const wikic = new Wikic()
    try {
      wikic.beforeWrite()
    } catch (e) {
      expect(e.message).toBe('should pass a function')
    }
  })
})

describe('afterRead', () => {
  it('works', async () => {
    const wikic = new Wikic()
    const callback = jest.fn(context => context)
    const length = wikic.afterReadTasks.length

    expect(wikic.afterRead(callback)).toBe(wikic)
    expect(wikic.afterReadTasks.length).toBe(length + 1)
    await wikic.build()
    expect(callback.mock.calls.length).not.toBeLessThan(1)
  })

  it('throws if not pass a function', () => {
    const wikic = new Wikic()
    try {
      wikic.afterRead()
    } catch (e) {
      expect(e.message).toBe('should pass a function')
    }
  })
})

test('baseurl works', () => {
  const wikic = new Wikic()
  wikic.setBaseURL('note')
  expect(wikic.baseurl).toBe('/note')
  expect(wikic.getURL('')).toBe('/note')
  expect(wikic.getURL('css/main.css')).toBe('/note/css/main.css')
  expect(wikic.getURL('/css/main.css')).toBe('/note/css/main.css')
})

test('return this', () => {
  const wikic = new Wikic()
  const keys = ['clean', 'configureRenderer', 'setConfig', 'setup', 'watch', 'serve', 'setBaseURL']
  keys.forEach((key) => {
    expect(wikic[key]()).toBe(wikic)
  })
})

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
    try {
      await wikic.build()
    } catch (e) {
      expect(e).not.toBeDefined()
    }

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
    try {
      await wikic.buildDocs()
      await wikic.buildIndex()
    } catch (e) {
      expect(e.message).toBe('should set `indexLayout` in _config.json')
    }
  })
})

test('typeMap', () => {
  const wikic = new Wikic()
  expect(wikic.typeMap('css')).toBe('CSS')
  expect(wikic.typeMap('bash')).toBe('Bash')
})
