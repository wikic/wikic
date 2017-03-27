/* eslint-disable no-underscore-dangle */
const fsp = require('fs-promise')
const path = require('path')
const chokidar = require('chokidar')

const Kit = require('./lib/plugins/Kit')
const renderer = require('./lib/plugins/renderer')
const { makeIndex, makeDoc } = require('./lib/plugins/maker')
const fillInfo = require('./lib/plugins/fillInfo')

const server = require('./lib/utils/server')
const logger = require('./lib/utils/log')

const { glob } = require('./lib/utils/promisified')
const capitalize = require('./lib/utils/capitalize')

const defaultConfig = require('./lib/defaultConfig.json')

const { isMarkdown, renderMD } = Kit

class Wikic {
  constructor(cwd) {
    this.renderer = renderer
    this.fillInfo = fillInfo.bind(this)
    this.buildStaticFile = this.buildStaticFile.bind(this)
    this.typeMap = this.typeMap.bind(this)
    this.kit = new Kit()
    this.setup(cwd)
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
    this.docsInfos = {}
    const generate = makeDoc.bind(this)

    return glob('**/*.md', { cwd: this.docsPath })
      .then(files => Promise.all(files.map(generate)))
  }

  async render() {
    this.clean()
    await Promise.all([this.buildStaticFiles(), this.buildDocs()])
    if (this.config.overwriteIndex) await this.buildIndex()
    logger.verbose('site rendered!')
    return this
  }

  async buildIndex() {
    const generate = makeIndex.bind(this)
    const dirs = await glob('**/', { cwd: this.docsPath })
    dirs.push('./')
    await Promise.all(dirs.map(generate))
  }

  async buildStaticFile(filePath) {
    const from = path.join(this.root, filePath)
    let to = path.join(this.publicPath, filePath)
    if (isMarkdown(from)) {
      const config = Object.assign({}, this.config)
      to = to.replace(/\.md$/, '.html')
      const result = await this.kit.readMD(from, config)
      const html = renderMD(result)
      await this.kit.writeMD(to, html)
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
