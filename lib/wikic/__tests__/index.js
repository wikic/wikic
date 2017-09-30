/* eslint-disable no-underscore-dangle */

jest.mock('fs-extra')
jest.mock('chokidar')
jest.mock('nunjucks')

jest.mock('../../utils/log')
jest.mock('../../utils/glob')

jest.mock('../../utils/get-config')
jest.mock('../../filters/load')
jest.mock('../../filters/toc')

const fse = require('fs-extra')
const chokidar = require('chokidar')
const path = require('path')

const Wikic = require('..')
const glob = require('../../utils/glob')
const logger = require('../../utils/log')

glob.__setPath('**/*', ['404.md', 'styles/main.css'])
glob.__setPath('**/*.md', ['css/flexbox.md', 'html/hi.md'])
glob.__setPath('**/', ['css/', 'html/'])

/* eslint-disable no-underscore-dangle */

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

describe('wikic.builder.readMD', () => {
  it('works if src not in context', async () => {
    const wikic = new Wikic()
    await wikic.builder.readMD({
      data: '',
      site: {},
      dist: 'a.html',
    })
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

describe('wikic.watch', () => {
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
    expect(fse.removeSync.mock.calls[0][0]).toMatch(path.join('docs', 'text.txt'))

    chokidar.__emiter.emit('error', Error('oops'))
    expect(logger.error.mock.calls.length).toBe(1)
    expect(logger.error.mock.calls[0][0]).toMatch('Error: oops')
  })
})

describe('wikic.clean', async () => {
  const wikic = new Wikic()
  expect(await wikic.clean()).toBe(wikic)
  expect(fse.emptyDir.mock.calls[0][0]).toBe(wikic.publicPath)
})
