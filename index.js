/* eslint-disable no-underscore-dangle */
const fsp = require('fs-promise')
const path = require('path')
const chokidar = require('chokidar')

const load = require('./lib/plugins/load')
const fillInfo = require('./lib/plugins/fillInfo')
const mdFilter = require('./lib/plugins/mdFilter')
const fmFilter = require('./lib/plugins/fmFilter')
const addTOC = require('./lib/plugins/addTOC')

const getNav = require('./lib/views/getNav')
const getList = require('./lib/views/getList')

const findDocs = require('./lib/utils/findDocs')
const renderer = require('./lib/utils/renderer')
const server = require('./lib/utils/server')
const logger = require('./lib/utils/log')

const { glob } = require('./lib/utils/promisified')
const capitalize = require('./lib/utils/capitalize')

const defaultConfig = require('./lib/defaultConfig.json')

class Wikic {
  constructor(cwd) {
    this.renderer = renderer
    this.afterReadTasks = [fmFilter, mdFilter] // after read before render
    this.beforeWriteTasks = [] // after render before write
    this.fillInfo = fillInfo.bind(this)
    this.buildStaticFile = this.buildStaticFile.bind(this)
    this.typeMap = this.typeMap.bind(this)
    this.writeMD = this.writeMD.bind(this)
    this.readMD = this.readMD.bind(this)
    this.setup(cwd)
  }

  afterReading(func) {
    if (typeof func === 'function') this.afterReadTasks.push(func)
  }

  beforeWriting(func) {
    if (typeof func === 'function') this.beforeWriteTasks.push(func)
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
      .then(this.writeMD)
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
      .catch(logger.error)
  }

  readMD(context) {
    let callbacks
    const promiseRead = typeof context.from === 'string' ?
      load(context).catch(logger.error) : Promise.resolve(context)
    if (Array.isArray(context.afterReadTasks)) {
      callbacks = context.skipRead ?
        context.afterReadTasks :
        this.afterReadTasks.concat(context.afterReadTasks)
    } else {
      callbacks = this.afterReadTasks
    }
    return callbacks
      .reduce((promise, callback) => promise.then(callback.bind(this)), promiseRead)
      .catch(logger.error)
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
    this.config = Object.assign({}, defaultConfig)
    const rootConfig = fsp.readJsonSync(path.join(this.cwd, '_config.json'))
    Object.assign(this.config, rootConfig)

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

  watch() {
    const watcher = chokidar.watch('**/*', {
      cwd: this.root,
      ignored: [
        /(^|[/\\])\../,
        `${this.config.publicPath}/**`,
        '**/node_modules/**',
        ...this.config.excludes,
      ],
      persistent: true,
    })

    watcher
      .on('change', this.handleFileChange.bind(this))
      .on('unlink', (filePath) => {
        logger.verbose(`File ${filePath} has been removed`)
        fsp.removeSync(path.join(this.publicPath, filePath))
      })
      .on('error', error => logger.error(`Watcher Error: ${error}`))
    return this
  }

  serve() {
    this.server = server({
      port: this.config.port,
      getCwd: () => this.publicPath,
      getBaseurl: () => this.config.baseurl,
    })
    return this
  }

  stopServer() {
    if (this.server) {
      this.server.close()
        .on('close', () => logger.info('Server stopped'))
        .on('error', e => logger.error(e))
    }
    return this
  }

  handleFileChange(filePath) {
    logger.verbose(`File ${filePath} has been changed`)
    this.setup().render()
  }

  buildDocs() {
    this.docsInfos = {} // reset docsInfos
    const beforeRenderDoc = (context) => {
      const { config } = context

      const navbar = getNav(config.types, this)
      const type = config.types.map(this.typeMap).join(' - ')
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
            afterReadTasks: [this.fillInfo, beforeRenderDoc],
            beforeWriteTasks: [addTOC],
          }).catch(logger.error)
        }
      )))
      .catch(logger.error)
  }

  async render() {
    this.clean()
    await Promise.all([this.buildStaticFiles(), this.buildDocs()])
    if (this.config.overwriteIndex) await this.buildIndex()
    logger.verbose('site rendered!')
    return this
  }

  async buildIndex() {
    const dirs = await glob('**/', { cwd: this.docsPath })
    dirs.push('./')

    const beforeRenderIndex = (context) => {
      if (typeof context.config.indexLayout !== 'string') {
        throw Error('should set `indexLayout` in _config.json')
      }
      // overwrite config.layout -> index
      const config = Object.assign({}, context.config, { layout: context.config.indexLayout })

      const types = config.types
      const type = types.map(this.typeMap).join(' - ')


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
        }).catch(logger.error)
      }
    ))
  }

  async buildStaticFile(filePath) {
    const from = path.join(this.root, filePath)
    const to = path.join(this.publicPath, filePath)
    if (Wikic.isMarkdown(from)) {
      const config = Object.assign({}, this.config)
      await this.buildMD({ from, to, config })
    } else {
      await fsp.copy(from, to)
    }
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
    await Promise.all(files.map(this.buildStaticFile))
  }

  clean() {
    fsp.emptyDirSync(this.publicPath)
    logger.verbose('site cleaned!')
    return this
  }
}

module.exports = Wikic
