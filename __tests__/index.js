jest.mock('fs-promise')
jest.mock('../lib/utils/glob')
jest.mock('../lib/utils/server', () => () => true)
jest.mock('../lib/plugins/addTOC', () => context => context)
jest.mock('../lib/plugins/load', () => context => Promise.resolve(context))
jest.mock('../lib/utils/log', () => jest.genMockFromModule('../lib/utils/log'))

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

jest.mock('chokidar', () => {
  const chokidar = jest.genMockFromModule('chokidar')
  const watch = jest.fn(() => ({
    on: jest.fn(() => watch()),
  }))
  chokidar.watch = watch
  return chokidar
})

jest.mock('../lib/utils/renderer', () => {
  const renderer = {}
  renderer.configure = jest.fn()
  renderer.render = jest.fn((layout, context) => context.content)
  renderer.env = {}
  renderer.env.addGlobal = jest.fn()
  renderer.env.addFilter = jest.fn()
  return renderer
})

const Wikic = require('../index')
const logger = require('../lib/utils/log')
const glob = require('../lib/utils/glob')

/* eslint-disable no-underscore-dangle */
glob.__setPath('**/*', ['404.md', 'styles/main.css'])
glob.__setPath('**/*.md', ['css/flexbox.md', 'html/hi.md'])
glob.__setPath('**/', ['css/', 'html/'])
/* eslint-enable no-underscore-dangle */



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

describe('type of docs', () => {
  it('typeMap', () => {
    const wikic = new Wikic()
    expect(wikic.typeMap('css')).toBe('CSS')
    expect(wikic.typeMap('bash')).toBe('Bash')
  })

  it('getTypeLink', () => {
    const wikic = new Wikic()
    expect(wikic.getTypeLink(['css'])).toEqual({
      url: '/wikic/css/',
      value: 'CSS',
    })
    expect(wikic.getTypeLink(['frontend', 'css'])).toEqual({
      url: '/wikic/frontend/css/',
      value: 'CSS',
    })
    expect(wikic.getTypeLink(['xx', 'cc'])).toEqual({
      url: '/wikic/xx/cc/',
      value: 'Cc',
    })
  })

  it('getTypeLinks', () => {
    const wikic = new Wikic()
    expect(wikic.getTypeLinks(['css'])).toEqual([{
      url: '/wikic/css/',
      value: 'CSS',
    }])

    expect(wikic.getTypeLinks(['frontend', 'css'])).toEqual([
      {
        url: '/wikic/frontend/',
        value: 'FrontEnd',
      },
      {
        url: '/wikic/frontend/css/',
        value: 'CSS',
      },
    ])
  })
})

