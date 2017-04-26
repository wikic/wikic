/* eslint-disable no-underscore-dangle */
const fsp = require('fs-promise')
const path = require('path')
const chokidar = require('chokidar')
const nunjucks = require('nunjucks')
const _ = require('lodash')

const load = require('./plugins/load')
const fillInfo = require('./plugins/fillInfo')
const mdFilter = require('./plugins/mdFilter')
const fmFilter = require('./plugins/fmFilter')
const njFilter = require('./plugins/njFilter')
const addTOC = require('./plugins/addTOC')

const { isMarkdown } = require('./utils/typeof')
const logger = require('./utils/log')
const getList = require('./utils/getList')
const getConfig = require('./utils/getConfig')
const server = require('./utils/server')
const glob = require('./utils/glob')
const capitalize = require('./utils/capitalize')

class Wikic {
  constructor(cwd) {
    this._getListOpts = undefined
    this._building = false
    this._afterReadTasks = [fmFilter, mdFilter, njFilter, fillInfo] // after read before render
    this._beforeWriteTasks = [addTOC] // after render before write
    this.setup(cwd)
  }

  setup(cwd = this.cwd || process.cwd()) {
    this.cwd = path.resolve(cwd)
    this.config = getConfig(this.cwd)

    const { root, publicPath, docsPath, layoutPath } = this.config
    this.root = path.resolve(this.cwd, root)
    this.publicPath = path.resolve(this.root, publicPath)
    this.layoutPath = path.resolve(this.root, layoutPath)
    this.docsPath = path.resolve(this.root, docsPath)

    this.renderer = nunjucks.configure(this.layoutPath, {
      trimBlocks: true,
      autoescape: true,
      watch: false,
    })
    this.renderer.addFilter('baseurl', url => this.getURL(url))
    this.renderer.addFilter('typeMap', key => this.typeMap(key))
    this.renderer.addFilter('typeMaps', arr => arr.map(key => this.typeMap(key)))

    return this
  }

  async clean() {
    await fsp.emptyDir(this.publicPath)
    logger.verbose('site cleaned!')
    return this
  }

  async build() {
    if (this._building) {
      logger.error('Wikic is busy.')
      return this
    }
    this._building = true
    await Promise.all([this.buildStaticFiles(), this.buildDocs()])
    logger.verbose('site rendered!')
    this._building = false
    return this
  }

  afterRead(func) {
    if (_.isFunction(func)) {
      this._afterReadTasks.push(func)
    } else {
      throw Error('should pass a function')
    }
    return this
  }

  beforeWrite(func) {
    if (_.isFunction(func)) {
      this._beforeWriteTasks.push(func)
    } else {
      throw Error('should pass a function')
    }
    return this
  }

  setListTemplate(opts) {
    if (!_.isPlainObject(opts)) throw Error('expect opts to be a Object')
    this._getListOpts = opts
    return this
  }

  renderMD(context) {
    const { data: oData, page, renderContext: oRenderContext } = context
    const { layout } = page
    const renderContext = Object.assign(oRenderContext, {
      content: oData,
    })
    const data = this.renderer.render(`${layout}.njk`, renderContext)

    return Object.assign(context, { data })
  }

  buildMD(_context) {
    return this.readMD(_context)
      .then(context => this.renderMD(context))
      .then(context => this.writeMD(context))
      .catch(logger.error)
  }

  async writeMD(context) {
    let newContext = context
    /* eslint-disable no-await-in-loop, no-restricted-syntax */
    for (const callback of this._beforeWriteTasks) {
      newContext = await callback.call(this, newContext)
    }
    /* eslint-enable no-await-in-loop, no-restricted-syntax */
    const { dist, data } = newContext

    if (_.isString(dist) && _.isString(data)) {
      await fsp.outputFile(newContext.dist, newContext.data)
    }
    return newContext
  }

  async readMD(context) {
    let newContext = await load(context)
    /* eslint-disable no-await-in-loop, no-restricted-syntax */
    for (const callback of this._afterReadTasks) {
      newContext = await callback.call(this, newContext)
    }
    /* eslint-enable no-await-in-loop, no-restricted-syntax */
    return newContext
  }

  watch() {
    /* ignores all the files start _ (excludes layoutPath and docsPath) */
    const ignored = [
      /(^|[/\\])\../,
      `${this.config.publicPath}/**`,
      '**/node_modules/**',
      ...this.config.excludes,
    ]

    const startWith_ = [];
    [this.config.layoutPath, this.config.docsPath].forEach((pathname) => {
      if (/^_.+/.test(pathname)) {
        startWith_.push(pathname.replace(/^_/, ''))
      }
    })

    if (startWith_.length > 0) {
      ignored.push(`_!(${startWith_.join('|')})/**`)
    } else {
      ignored.push('_*/**')
    }

    chokidar
      .watch('**/*', {
        ignored,
        cwd: this.root,
        persistent: true,
      })
      .on('change', (filePath) => {
        logger.verbose(`File ${filePath} has been changed`)
        this.setup().build()
      })
      .on('unlink', (filePath) => {
        logger.verbose(`File ${filePath} has been removed`)
        fsp.removeSync(path.join(this.publicPath, filePath))
      })
      .on('error', error => logger.error(`Watcher Error: ${error}`))
    return this
  }

  serve() {
    server
      .create({
        port: this.config.port,
        getCwd: () => this.publicPath,
        getBaseurl: () => this.config.baseurl,
      })
      .listen()
    return this
  }

  async buildDocs() {
    this.docsInfos = {} // reset docsInfos

    const files = await glob('**/*.md', { cwd: this.docsPath })
    const contexts = await Promise.all(files.map(filePath => this._readDoc(filePath)))

    this.list = getList(this, this.docsInfos, this._getListOpts)
    await Promise.all(
      contexts.map(_context =>
        Promise.resolve(_context)
          .then(context => this._beforeRenderDoc(context))
          .then(context => this.renderMD(context))
          .then(context => this.writeMD(context)))
    )
  }

  _beforeRenderDoc(context) {
    const { renderContext: oldRenderContext } = context

    const renderContext = Object.assign({}, oldRenderContext, {
      list: this.list,
    })

    return Object.assign(context, { renderContext })
  }

  _readDoc(filePath) {
    const targetRelative = filePath.replace(/\.md$/, '.html')

    const src = path.join(this.docsPath, filePath)
    const dist = path.join(this.publicPath, targetRelative)

    const types = path.dirname(filePath).split('/')
    const address = path.join('/', targetRelative)
    const site = Object.assign({}, this.config)
    const page = { types, address }
    return this.readMD({
      src,
      dist,
      site,
      page,
      IS_DOC: true,
    })
  }

  async buildStaticFiles() {
    const { excludes, publicPath } = this.config
    const files = await glob('**/*', {
      cwd: this.root,
      nodir: true,
      ignore: [`${publicPath}/**`, '_*/**', '**/node_modules/**', ...excludes],
    })
    await Promise.all(
      files.map(async (filePath) => {
        const src = path.join(this.root, filePath)
        const dist = path.join(this.publicPath, filePath)
        if (isMarkdown(src)) {
          const site = Object.assign({}, this.config)
          await this.buildMD({
            site,
            src,
            dist: dist.replace(/\.md$/, '.html'),
          })
        } else {
          await fsp.copy(src, dist)
        }
      })
    )
  }

  typeMap(key) {
    const map = this.config.typeMap
    if (Object.prototype.hasOwnProperty.call(map, key) && _.isString(map[key])) {
      return map[key]
    }
    return capitalize(key)
  }

  getURL(url) {
    return path.join('/', this.config.baseurl, url)
  }
}

module.exports = Wikic
