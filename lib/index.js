/* eslint-disable no-underscore-dangle */
const fsp = require('fs-promise')
const path = require('path')
const chokidar = require('chokidar')

const load = require('./plugins/load')
const fillInfo = require('./plugins/fillInfo')
const mdFilter = require('./plugins/mdFilter')
const fmFilter = require('./plugins/fmFilter')
const addTOC = require('./plugins/addTOC')

const getList = require('./views/getList')

const { isString, isFunction, isMarkdown } = require('./utils/typeof')
const logger = require('./utils/log')
const getConfig = require('./utils/getConfig')
const renderer = require('./utils/renderer')
const server = require('./utils/server')
const glob = require('./utils/glob')
const capitalize = require('./utils/capitalize')

class Wikic {
  constructor(cwd) {
    this.building = false
    this.afterReadTasks = [fmFilter, mdFilter] // after read before render
    this.beforeWriteTasks = [] // after render before write
    this.setup(cwd)
  }

  configureRenderer() {
    renderer.configure(this.layoutPath, {
      autoescape: true,
      watch: false,
    })
    renderer.env.addGlobal('site', this.config)
    renderer.env.addFilter('typeMap', key => this.typeMap(key))
    renderer.env.addFilter('baseurl', url => this.getURL(url))
    return this
  }

  setConfig() {
    this.config = getConfig(this.cwd)

    const { root, publicPath, docsPath, layoutPath } = this.config
    this.root = path.resolve(this.cwd, root)
    this.publicPath = path.resolve(this.root, publicPath)
    this.layoutPath = path.resolve(this.root, layoutPath)
    this.docsPath = path.resolve(this.root, docsPath)

    this.configureRenderer()
    return this
  }

  setup(cwd = this.cwd || process.cwd()) {
    this.cwd = path.resolve(cwd)
    this.setConfig()
    return this
  }

  async clean() {
    await fsp.emptyDir(this.publicPath)
    logger.verbose('site cleaned!')
    return this
  }

  async build() {
    if (this.building) {
      logger.error('Wikic is busy.')
      return this
    }
    this.building = true
    try {
      await Promise.all([this.buildStaticFiles(), this.buildDocs()])
      logger.verbose('site rendered!')
    } catch (e) {
      logger.error(e)
    }
    this.building = false
    return this
  }

  afterRead(func) {
    if (isFunction(func)) {
      this.afterReadTasks.push(func)
    } else {
      throw Error('should pass a function')
    }
    return this
  }

  beforeWrite(func) {
    if (isFunction(func)) {
      this.beforeWriteTasks.push(func)
    } else {
      throw Error('should pass a function')
    }
    return this
  }

  static renderMD(context) {
    const { data, config } = context
    const layout = config.page.layout
    const renderContext = Object.assign(
      {
        content: data,
        page: config.page,
      },
      context.renderContext
    )
    const html = renderer.render(`${layout}.njk`, renderContext)
    return Object.assign(context, { data: html })
  }

  buildMD(context) {
    return this.readMD(context)
      .then(Wikic.renderMD)
      .then((...arg) => this.writeMD(...arg))
      .catch(logger.error)
  }

  async writeMD(context) {
    let callbacks
    if (Array.isArray(context.beforeWriteTasks)) {
      callbacks = this.beforeWriteTasks.concat(context.beforeWriteTasks)
    } else {
      callbacks = this.beforeWriteTasks
    }

    let newContext = context
    /* eslint-disable no-await-in-loop, no-restricted-syntax */
    for (const callback of callbacks) {
      newContext = await callback.call(this, newContext)
    }
    /* eslint-enable no-await-in-loop, no-restricted-syntax */
    const { to, data } = newContext
    if (isString(to) && isString(data)) {
      await fsp.outputFile(newContext.to, newContext.data)
    }
    return newContext
  }

  async readMD(context) {
    const promiseRead = isString(context.from) ? load(context) : Promise.resolve(context)

    let callbacks
    if (Array.isArray(context.afterReadTasks)) {
      if (context.skipRead) {
        callbacks = context.afterReadTasks
      } else {
        callbacks = this.afterReadTasks.concat(context.afterReadTasks)
      }
    } else {
      callbacks = this.afterReadTasks
    }

    let newContext = await promiseRead
    /* eslint-disable no-await-in-loop, no-restricted-syntax */
    for (const callback of callbacks) {
      newContext = await callback.call(this, newContext)
    }
    /* eslint-enable no-await-in-loop, no-restricted-syntax */
    return newContext
  }

  watch() {
    /* ignore all the files start _ (exclude layoutPath and docsPath */
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
      ignored.push(`_!(${startWith_.join('|')})/*`)
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

    this.list = getList(this)
    await Promise.all(
      contexts
        .map(context => this._beforeRenderDoc(context))
        .map(context => Wikic.renderMD(context))
        .map(context => this.writeMD(context))
    )
  }

  _beforeRenderDoc(context) {
    const { config, renderContext: oldRenderContext } = context

    const type = config.types.map((...arg) => this.typeMap(...arg)).join(' - ')
    const renderContext = Object.assign({}, oldRenderContext, {
      type,
      list: this.list,
    })

    return Object.assign(context, { renderContext })
  }

  _readDoc(filePath) {
    const targetRelative = filePath.replace(/\.md$/, '.html')

    const from = path.join(this.docsPath, filePath)
    const to = path.join(this.publicPath, targetRelative)

    const types = path.dirname(filePath).split('/')
    const address = path.join('/', targetRelative)
    const config = Object.assign({}, this.config, { types, address })

    return this.readMD({
      from,
      to,
      config,
      afterReadTasks: [fillInfo],
      beforeWriteTasks: [addTOC],
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
        const from = path.join(this.root, filePath)
        const to = path.join(this.publicPath, filePath)
        if (isMarkdown(from)) {
          const config = Object.assign({}, this.config)
          await this.buildMD({
            from,
            to: to.replace(/\.md$/, '.html'),
            config,
          })
        } else {
          await fsp.copy(from, to)
        }
      })
    )
  }

  typeMap(key) {
    const map = this.config.typeMap
    if (isString(map[key])) {
      return map[key]
    }
    return capitalize(key)
  }

  getURL(url) {
    return path.join('/', this.config.baseurl, url)
  }
}

module.exports = Wikic
