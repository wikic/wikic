/* eslint-disable no-underscore-dangle */
const fsp = require('fs-promise')
const path = require('path')
const chokidar = require('chokidar')
const isObject = require('isobject')

const load = require('./lib/plugins/load')
const fillInfo = require('./lib/plugins/fillInfo')
const mdFilter = require('./lib/plugins/mdFilter')
const fmFilter = require('./lib/plugins/fmFilter')
const addTOC = require('./lib/plugins/addTOC')

const getNav = require('./lib/views/getNav')
const getList = require('./lib/views/getList')

const logger = require('./lib/utils/log')
const getConfig = require('./lib/utils/getConfig')
const findDocs = require('./lib/utils/findDocs')
const renderer = require('./lib/utils/renderer')
const simpleServer = require('./lib/utils/server')
const glob = require('./lib/utils/glob')
const capitalize = require('./lib/utils/capitalize')

class Wikic {
  constructor(cwd) {
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
    renderer.env.addFilter('typeMap', (...arg) => this.typeMap(...arg))
    renderer.env.addFilter('absolute', (...arg) => this.getURL(...arg))
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

  setup(cwd = (this.cwd || process.cwd())) {
    this.cwd = path.resolve(cwd)
    this.setConfig()
      .setBaseURL()
    return this
  }

  clean() {
    fsp.emptyDirSync(this.publicPath)
    logger.verbose('site cleaned!')
    return this
  }

  async build() {
    this.clean()
    await Promise.all([this.buildStaticFiles(), this.buildDocs()])
    if (this.config.overwriteIndex) await this.buildIndex()
    logger.verbose('site rendered!')
    return this
  }

  afterRead(func) {
    if (typeof func === 'function') {
      this.afterReadTasks.push(func)
    } else {
      throw Error('should pass a function')
    }
    return this
  }

  beforeWrite(func) {
    if (typeof func === 'function') {
      this.beforeWriteTasks.push(func)
    } else {
      throw Error('should pass a function')
    }
    return this
  }

  static isMarkdown(filePath) {
    return path.extname(filePath) === '.md'
  }

  static renderMD(context) {
    const { data, config } = context
    let layout
    let title
    if (typeof config.attributes === 'undefined') {
      layout = config.layout
    } else {
      layout = config.attributes.layout || config.layout
      title = config.attributes.title
    }
    const page = { title }
    const renderContext = Object.assign({
      content: data,
      page,
    }, context.renderContext)
    const html = renderer.render(`${layout}.njk`, renderContext)
    return Object.assign(context, { data: html })
  }

  buildMD(context) {
    return this.readMD(context)
      .then(Wikic.renderMD)
      .then((...arg) => this.writeMD(...arg))
  }

  writeMD(context) {
    let callbacks
    if (Array.isArray(context.beforeWriteTasks)) {
      callbacks = this.beforeWriteTasks.concat(context.beforeWriteTasks)
    } else {
      callbacks = this.beforeWriteTasks
    }
    return callbacks
      .reduce((promise, callback) => promise.then(callback.bind(this)), Promise.resolve(context))
      .then(({ to, data }) => fsp.outputFile(to.replace(/\.md$/, '.html'), data))
  }

  readMD(context) {
    let callbacks
    const promiseRead = typeof context.from === 'string' ?
      load(context) : Promise.resolve(context)
    if (Array.isArray(context.afterReadTasks)) {
      callbacks = context.skipRead ?
        context.afterReadTasks :
        this.afterReadTasks.concat(context.afterReadTasks)
    } else {
      callbacks = this.afterReadTasks
    }
    return callbacks
      .reduce((promise, callback) => promise.then(callback.bind(this)), promiseRead)
  }

  watch() {
    chokidar.watch('**/*', {
      cwd: this.root,
      ignored: [
        /(^|[/\\])\../,
        `${this.config.publicPath}/**`,
        '**/node_modules/**',
        ...this.config.excludes,
      ],
      persistent: true,
    })
      .on('change', (filePath) => {
        logger.verbose(`File ${filePath} has been changed`)
        this.setup().render()
      })
      .on('unlink', (filePath) => {
        logger.verbose(`File ${filePath} has been removed`)
        fsp.removeSync(path.join(this.publicPath, filePath))
      })
      .on('error', error => logger.error(`Watcher Error: ${error}`))
    return this
  }

  serve() {
    simpleServer({
      port: this.config.port,
      getCwd: () => this.publicPath,
      getBaseurl: () => this.config.baseurl,
    })
    return this
  }

  buildDocs() {
    this.docsInfos = {} // reset docsInfos
    const beforeRenderDoc = (context) => {
      const { config } = context

      const navbar = getNav(config.types, this)
      const type = config.types.map((...arg) => this.typeMap(...arg)).join(' - ')
      const renderContext = Object.assign({}, context.renderContext, { navbar, type })

      return Object.assign(context, { renderContext })
    }

    return glob('**/*.md', { cwd: this.docsPath })
      .then(files => Promise.all(files.map(
        (filePath) => {
          const targetRelative = filePath.replace(/\.md$/, '.html')

          const from = path.join(this.docsPath, filePath)
          const to = path.join(this.publicPath, targetRelative)

          const types = path.dirname(filePath).split('/')
          const address = path.join('/', targetRelative)
          const config = Object.assign({}, this.config, { types, address })

          return this.buildMD({
            from,
            to,
            config,
            afterReadTasks: [fillInfo, beforeRenderDoc],
            beforeWriteTasks: [addTOC],
          })
        }
      )))
  }

  async buildIndex() {
    if (!isObject(this.docsInfos) || Object.keys(this.docsInfos).length <= 0) {
      throw Error('require run buildDocs first.')
    }
    const dirs = await glob('**/', { cwd: this.docsPath })
    dirs.push('./')

    const beforeRenderIndex = (context) => {
      if (typeof context.config.indexLayout !== 'string' || context.config.indexLayout === '') {
        throw Error('should set `indexLayout` in _config.json')
      }
      // overwrite config.layout -> index
      const config = Object.assign({}, context.config, { layout: context.config.indexLayout })

      const types = config.types
      const type = types.map((...arg) => this.typeMap(...arg)).join(' - ')


      // get content of index
      const collections = (types[0] === '.') ? this.docsInfos : findDocs(this.docsInfos, types)
      const data = getList(types, collections, this)
      const navbar = getNav(types, this)

      const renderContext = Object.assign({}, context.renderContext, { navbar, type })

      return Object.assign(context, { data, renderContext, config })
    }

    await Promise.all(dirs.map(
      (dir) => {
        const dirname = dir.slice(0, dir.length - 1) // ignore `/`
        const types = dirname.split('/')
        const to = path.join(this.publicPath, dirname, 'index.html')
        const address = path.join('/', dirname, '/')
        const config = Object.assign({}, this.config, { types, address })
        return this.buildMD({
          config,
          to,
          afterReadTasks: [beforeRenderIndex],
          skipRead: true,
        })
      }
    ))
  }

  async buildStaticFiles() {
    const { excludes, publicPath } = this.config
    const files = await glob('**/*', {
      cwd: this.root,
      nodir: true,
      ignore: [
        `${publicPath}/**`,
        '_*/**',
        '**/node_modules/**',
        ...excludes,
      ],
    })
    await Promise.all(files.map(async (filePath) => {
      const from = path.join(this.root, filePath)
      const to = path.join(this.publicPath, filePath)
      if (Wikic.isMarkdown(from)) {
        const config = Object.assign({}, this.config)
        await this.buildMD({
          from,
          to: to.replace(/\.md$/, '.html'),
          config,
        })
      } else {
        await fsp.copy(from, to)
      }
    }))
  }

  setBaseURL(url = this.config.baseurl) {
    this.baseurl = `/${url}`
    return this
  }

  typeMap(key) {
    const map = this.config.typeMap
    if (typeof map[key] === 'string') {
      return map[key]
    }
    return capitalize(key)
  }

  getURL(url) {
    return path.join(this.baseurl, url)
  }

  getTypeLinks(types) {
    const handleType = (type, idx, arr) => {
      const url = this.getTypeURL(arr.slice(0, idx + 1))
      const value = this.typeMap(type)
      return { url, value }
    }
    return types.map(handleType)
  }

  getTypeLink(types) {
    const type = types[types.length - 1]
    const url = this.getTypeURL(types)
    const value = this.typeMap(type)
    return { url, value }
  }

  getTypeURL(types) {
    return path.join(this.baseurl, ...types, '/')
  }
}

module.exports = Wikic
