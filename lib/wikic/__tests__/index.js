jest.mock('fs-extra')
jest.mock('nunjucks', () => require('../../../mocks/nunjucks'))
jest.mock('../../utils/get-closest-config', () => require('../../../mocks/get-closest-config'))

jest.mock('../../utils/log')
jest.mock('../../utils/get-config', () => () => ({
  root: '.',
  docsPath: '_note',
  title: 'Wikic Demo',
  baseurl: 'wikic',
  port: 4500,
  layoutPath: '_layouts',
  publicPath: '../docs',
  excludes: ['gulpfile.js', 'index.js', 'yarn.lock', 'package.json', '**/node_modules/**'],
  typeMap: {
    css: 'CSS',
    frontend: 'FrontEnd',
    webapi: 'Web API',
    html: 'HTML',
    ecmascript: 'ECMAScript',
    '.': 'Home',
  },
  page: {
    layout: 'default',
    toc: true,
  },
  logger: {
    console: 'verbose',
    file: 'verbose',
  },
  typeNameTitleCase: true,
}))

const fse = require('fs-extra')
const path = require('path')

const Wikic = require('..')
const logger = require('../../utils/log')

test('cwd', () => {
  const wikic = new Wikic('xxxxx')
  expect(wikic.cwd).toMatch(/xxxxx$/)
})

test('wikic.getURL', () => {
  const wikic = new Wikic()
  wikic.config.baseurl = 'note'
  expect(wikic.getURL('')).toBe('/note')
  expect(wikic.getURL('css/main.css')).toBe('/note/css/main.css')
  expect(wikic.getURL('/css/main.css')).toBe('/note/css/main.css')
})

test('wikic.typeMap', () => {
  const wikic = new Wikic()
  expect(wikic.typeMap('css')).toBe('CSS')
  expect(wikic.typeMap('bash')).toBe('Bash')
  wikic.config.typeNameTitleCase = false
  expect(wikic.typeMap('bash')).toBe('bash')
})

describe('wikic.registerSuite', () => {
  it('throws if pass a falsy', () => {
    const wikic = new Wikic()
    expect(() => {
      wikic.registerSuite()
    }).toThrow()
  })
})

describe('wikic.build', () => {
  it('call build() will call once only', () => {
    logger.error.mockClear()
    const wikic = new Wikic()
    wikic.build()
    wikic.build()
    expect(logger.error.mock.calls.length).toBe(1)
  })
})

describe('wikic.renderer(nunjucks)', () => {
  it('relative Filter', async () => {
    const wikic = new Wikic()
    wikic.renderer.addFilter.mockClear()
    await wikic.builder.renderMD({
      data: '',
      page: {
        address: '/base/c/d.html',
      },
      renderContext: {},
      dist: path.resolve('a', 'b', 'c', 'd.html'),
    })
    expect(wikic.renderer.addFilter).toHaveBeenCalledTimes(1)
    expect(wikic.renderer.addFilter.mock.calls[0][0]).toBe('relative')
    expect(wikic.renderer.addFilter.mock.calls[0][1]('/base/c/f.html')).toBe('f.html')
  })
})

describe('wikic.clean', async () => {
  const wikic = new Wikic()
  expect(await wikic.clean()).toBe(wikic)
  expect(fse.emptyDir.mock.calls[0][0]).toBe(wikic.publicPath)
})
