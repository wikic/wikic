/* eslint-disable no-underscore-dangle */
const fsp = require('fs-promise')
const htmlclean = require('htmlclean')
const path = require('path')
const chokidar = require('chokidar')

const load = require('./lib/plugins/load')
const mdFilter = require('./lib/plugins/mdFilter')
const fmFilter = require('./lib/plugins/fmFilter')
const renderer = require('./lib/plugins/renderer')

const server = require('./lib/utils/server')
const logger = require('./lib/utils/log')
const findDocs = require('./lib/utils/findDocs')

const { glob } = require('./lib/utils/promisified')
const capitalize = require('./lib/utils/capitalize')

const addTOC = require('./lib/views/addTOC')
const getList = require('./lib/views/getList')
const getNav = require('./lib/views/getNav')

const configFileName = '_config.json'

const defaultConfig = {
  root: '.',
  docsPath: '_note',
  title: '',
  docsLayout: 'docs',
  indexLayout: 'index',
  baseurl: '',
  port: 4000,
  overwriteIndex: false,
  layoutPath: '_layouts',
  publicPath: 'docs',
  excludes: [],
  typeMap: {},
}

class Wikic {
  constructor() {
    this.config = Object.assign({}, defaultConfig)
    this.setup()
    this.writeMarkdown = this.writeMarkdown.bind(this)
    this.writeIndex = this.writeIndex.bind(this)
    this.buildStaticFile = this.buildStaticFile.bind(this)
    this.renderDocs = this.renderDocs.bind(this)
    this.renderIndex = this.renderIndex.bind(this)
    this.fillInfo = this.fillInfo.bind(this)
    this.typeMap = this.typeMap.bind(this)
  }

  setBaseURL(url) {
    this.baseurl = `/${url}`
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
    return path.join(this.baseurl, ...types)
  }

  configureRenderer() {
    renderer.configure(this.layoutPath, {
      autoescape: false,
      watch: false,
    })
    renderer.env.addGlobal('site', this.config)
    renderer.env.addFilter('typeMap', (...arg) => this.typeMap(...arg))
    renderer.env.addFilter('absolute', (...arg) => this.getURL(...arg))
  }

  setup() {
    this.cwd = process.cwd()
    const rootConfig = fsp.readJsonSync(path.join(this.cwd, configFileName))
    Object.assign(this.config, rootConfig)
    this.setBaseURL(this.config.baseurl)
    this.setPaths()
    this.configureRenderer()
  }

  watch() {
    const watcher = chokidar.watch('**/*', {
      cwd: '.',
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
  }

  serve() {
    const port = this.config.port
    const cwd = () => this.publicPath
    const baseurl = () => this.config.baseurl
    this.server = server({
      port,
      cwd,
      baseurl,
    })
  }

  stopServer() {
    if (this.server) {
      this.server.close()
        .on('close', () => logger.info('Server stopped'))
        .on('error', e => logger.error(e))
    }
  }

  handleFileChange(filePath) {
    logger.verbose(`File ${filePath} has been changed`)
    this.setup()
    this.render()
  }

  setPaths() {
    const { root, publicPath, docsPath, layoutPath } = this.config
    this.publicPath = path.resolve(root, publicPath)
    this.layoutPath = path.resolve(root, layoutPath)
    this.docsPath = path.resolve(root, docsPath)
    this.root = path.resolve(root)
  }

  fillInfo({ data, config }) {
    const { _types, title, _address, hide } = config
    if (hide) return { data, config }
    if (typeof this.docsInfos !== 'object' && !this.docsInfos) this.docsInfos = {}
    const docInfo = {
      address: _address,
      title,
    }
    /* eslint-disable no-param-reassign */
    _types.reduce((parent, type, index, arr) => {
      if (typeof parent[type] !== 'object') {
        parent[type] = { _docs: [] }
      }
      if (index === arr.length - 1) {
        parent[type]._docs.push(docInfo)
      }
      return parent[type]
    }, this.docsInfos)
    /* eslint-enable no-param-reassign */
    return { data, config }
  }

  renderIndex({ config }) {
    const { _types, indexLayout } = config
    const collections = (_types[0] === '.') ? this.docsInfos : findDocs(this.docsInfos, _types)
    const content = getList(_types, collections, this)
    const navbar = getNav(_types, this)
    const type = _types.map(this.typeMap).join(' - ')
    const newData = renderer.render(`${indexLayout}.njk`, {
      navbar,
      content,
      type,
    })
    return newData
  }

  renderDocs({ data, config }) {
    const { docsLayout, title, _types } = config
    const navbar = getNav(_types, this)
    const type = _types.map(this.typeMap).join(' - ')
    const page = { title }
    const html = renderer.render(`${docsLayout}.njk`, {
      content: data,
      navbar,
      type,
      page,
    })
    return html
  }

  buildDocs() {
    this.docsInfos = {}
    return glob('**/*.md', { cwd: this.docsPath })
      .then(files => Promise.all(files.map(this.writeMarkdown)))
  }

  async render() {
    this.clean()
    await Promise.all([this.buildStaticFiles(), this.buildDocs()])
    if (this.config.overwriteIndex) await this.buildIndex()
    logger.verbose('site rendered!')
  }

  async buildIndex() {
    const dirs = await glob('**/', { cwd: this.docsPath })
    dirs.push('./')
    await Promise.all(dirs.map(this.writeIndex))
  }

  writeMarkdown(file) {
    const targetRelative = file.replace(/\.md$/, '.html')

    const fileFullPath = path.join(this.docsPath, file)
    const target = path.join(this.publicPath, targetRelative)

    const _types = path.dirname(file).split('/')
    const _address = path.join('/', targetRelative)
    const config = Object.assign({}, this.config, { _types, _address })

    return load({
      fileFullPath,
      defaultConfig: config,
      configFileName,
    })
      .then(fmFilter)
      .then(mdFilter)
      .then(this.fillInfo)
      .then(this.renderDocs)
      .then(addTOC)
      .then(htmlclean)
      .then(html => fsp.outputFile(target, html))
      .catch(e => logger.error(e))
  }

  writeIndex(dir) {
    const dirname = dir.slice(0, dir.length - 1)
    const _types = dirname.split('/')
    const target = path.join(this.publicPath, dirname, 'index.html')
    const _address = path.join('/', dirname, '/')
    const config = Object.assign({}, this.config, { _types, _address })
    return Promise.resolve()
      .then(() => this.renderIndex({ config }))
      .then(htmlclean)
      .then(html => fsp.outputFile(target, html))
      .catch(e => logger.error(e))
  }

  buildStaticFile(filePath) {
    const from = path.join(this.root, filePath)
    const to = path.join(this.publicPath, filePath)
    return fsp.copy(from, to)
  }

  async buildStaticFiles() {
    const { excludes, publicPath } = this.config
    const ignore = [
      `${publicPath}/**`,
      '_*/**',
      ...excludes,
    ]
    const files = await glob('**/*', {
      ignore,
      nodir: true,
      cwd: this.root,
    })
    await Promise.all(files.map(this.buildStaticFile))
  }

  clean() {
    fsp.emptyDirSync(this.publicPath)
    logger.verbose('site cleaned!')
  }
}

module.exports = Wikic
