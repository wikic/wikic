/* eslint-disable
   no-await-in-loop,
   no-restricted-syntax,
   no-param-reassign,
   global-require,
   import/no-dynamic-require */

const fse = require('fs-extra')
const path = require('path')
const titleCase = require('title-case')
const chokidar = require('chokidar')
const _ = require('lodash')
const importFrom = require('import-from')
const { _extend: assign } = require('util')

const loadFilters = require('./load-filters')
const getRenderer = require('./get-renderer')
const loadSuites = require('./load-suites')
const getWatchIgnored = require('./get-watch-ignored')
const getStaticIgnored = require('./get-static-ignored')
const getBuilder = require('./get-builder')
const setLogger = require('./set-logger')
const runBuiltInWatchHandler = require('./run-builtin-watch-handler')
const runCustomWatchHandler = require('./run-custom-watch-handler')

const isMarkdown = require('../utils/is-markdown')
const logger = require('../utils/log')
const getConfig = require('../utils/get-config')
const glob = require('../utils/glob')
const Filter = require('../utils/filter')
const time = require('../utils/time')

const TYPES = [
  'afterRead',
  'beforeWrite',
  'beforeRender',
  'afterReadAllDocs',
  'beforeBuild',
  'beforeBuildDocs',
  'afterBuild',
  'afterBuildDocs',
  'beforeWriteAsset',
]

const needNormalize = path.sep === path.win32.sep
const normalize = x => (needNormalize ? path.normalize(x) : x)

/**
 * a wikic
 * @class Wikic
 */
class Wikic {
  /**
   * @constructor
   * @param {string} cwd passed to wikic.setup
   * @param {object} config passed to wikic.setup
   */
  constructor(cwd, config) {
    this.building = false
    this.typeMap = this.typeMap.bind(this)
    this.buildDocsAsset = this.buildDocsAsset.bind(this)
    this.buildStaticFile = this.buildStaticFile.bind(this)
    /**
     * A shortcut for fs-extra
     * @member {object} fse
     */
    this.fse = fse
    this.setup(cwd, config)
  }

  /**
   * Reloads configurations and layouts
   * @param {string} cwd working dir, default value is `process.cwd()`
   * @param {object} config overwrite config from `cwd`'s `_config.yml` and `wikic.config.js`
   * @return {Wikic} this
   */
  setup(cwd, config) {
    /**
     * Working directory
     * @member {string} cwd
     */
    this.cwd = cwd ? path.resolve(cwd) : this.cwd || process.cwd()

    /**
     * Global Config
     * @member {object} config
     * */
    this.config = _.merge({}, getConfig(this.cwd), config)

    const { root, publicPath, docsPath, layoutPath } = this.config

    /* absolute path of config.root/publicPath/... */
    this.root = path.resolve(this.cwd, root)
    this.publicPath = path.resolve(this.root, publicPath)
    this.layoutPath = path.resolve(this.root, layoutPath)
    this.docsPath = path.resolve(this.root, docsPath)

    this.builder = getBuilder(this)

    /**
     * Nunjucks renderer
     * @member {Nunjucks.Environment} renderer
     * @see https://mozilla.github.io/nunjucks/api.html
     */
    this.renderer = getRenderer(this)

    /**
     * a Filter
     * @member {Filter} filter
     */
    this.filter = new Filter({
      types: TYPES,
    })

    loadFilters(this)
    loadSuites(this)
    setLogger(this)
    return this
  }

  /**
   * Cleans all the files in `publicPath`
   * @return {Promise}
   */
  async clean() {
    await fse.emptyDir(this.publicPath)
    logger.verbose('site cleaned!')
    return this
  }

  /**
   * Builds all the files in `docsPath` and `root`
   * @return {Promise}
   */
  async build() {
    if (this.building) {
      logger.error('Wikic is busy.')
      return this
    }
    const startTime = process.uptime()
    this.building = true

    const files = await glob('**/*', {
      cwd: this.root,
      nodir: true,
      absolute: true,
      ignore: getStaticIgnored(this.config),
    })

    const docsFiles = []
    const docsAssets = []
    const staticFiles = []
    files.forEach(x => {
      x = normalize(x)
      if (x.indexOf(this.docsPath) !== 0) {
        staticFiles.push(path.relative(this.root, x))
      } else if (isMarkdown(x)) {
        docsFiles.push(path.relative(this.docsPath, x))
      } else {
        docsAssets.push(path.relative(this.docsPath, x))
      }
    })

    await this.filter.exec('beforeBuild', null, this)
    this.configCaches = {
      dir2dir: {},
      dir2conf: {},
    }
    await Promise.all([
      ...staticFiles.map(this.buildStaticFile),
      ...docsAssets.map(this.buildDocsAsset),
      this.buildDocs(docsFiles),
    ])
    logger.verbose(time(), 'Site Rendered', `after ${(process.uptime() - startTime).toFixed(3)} s`)
    this.building = false

    await this.filter.exec('afterBuild', null, this)
    return this
  }

  /**
   * Register suite of filters
   * @param {string|object|function(object,Wikic)} suite
   * @return {Wikic} this
   */
  registerSuite(suite) {
    if (!suite) throw Error('expect a suite passed')

    if (_.isString(suite)) {
      const suiteStr = suite
      suite = importFrom.silent(this.cwd, suite)
      if (!suite) {
        throw Error(`suite '${suiteStr}' not found`)
      }
    }

    suite = _.isFunction(suite) ? suite(this.config, this) : suite

    if (!suite) {
      return this
    }

    TYPES.forEach(type => {
      const filter = suite[type]
      if (filter) {
        this.filter.register(type, filter)
      }
    })

    return this
  }

  /**
   * Watches file change and run `wikic.build()` when changed
   * @return Wikic this
   */
  watch() {
    chokidar
      .watch('**/*', {
        ignored: getWatchIgnored(this.config),
        cwd: this.root,
        persistent: true,
      })
      .on('change', filePath => {
        const matchers = {
          setupAndBuild: ['**/wikic.config.js', '**/_config.yml'],
          build: [`${this.config.layoutPath}/**`, `${this.config.docsPath}/**`],
          buildStaticFile: '**/*',
        }
        assign(matchers, this.config.watchHandlers)
        const { custom } = matchers
        if (runBuiltInWatchHandler(filePath, matchers, this) !== false) return
        if (runCustomWatchHandler(filePath, custom, this) !== false) return
        logger.verbose(`[watch]: Nothing to do with file ${filePath}`)
      })
      .on('error', error => logger.error(`Watcher Error: ${error}`))
    return this
  }

  serve() {
    const { config, publicPath, cwd } = this
    if (config.server) {
      const server =
        typeof config.server === 'string' ? importFrom.silent(cwd, config.server) : config.server
      if (typeof server === 'function') {
        return server(config, publicPath)
      }
    }
    logger.error('wikic.config.server should be a function or a string')
    return null
  }

  /**
   * Build markdown in `docsPath`
   * @return {Promise}
   */
  async buildDocs(files) {
    await this.filter.exec('beforeBuildDocs', null, this)
    if (files.length < 1) return
    const contexts = await Promise.all(files.map(this.builder.readDoc))
    await this.filter.exec('afterReadAllDocs', null, this)

    await Promise.all(
      contexts.map(context =>
        Promise.resolve(context)
          .then(this.builder.renderMD)
          .then(this.builder.writeMD)
      )
    )
    await this.filter.exec('afterBuildDocs', null, this)
  }

  async buildDocsAsset(filePath) {
    const src = path.join(this.docsPath, filePath)
    const dist = path.join(this.publicPath, filePath)
    await this.builder.buildAsset({
      src,
      dist,
    })
  }

  async buildStaticFile(filePath) {
    const src = path.join(this.root, filePath)
    const dist = path.join(this.publicPath, filePath)
    if (isMarkdown(src)) {
      const site = assign({}, this.config)
      await this.builder.buildMD({
        site,
        src,
        dist: dist.replace(/\.md$/, '.html'),
        configCaches: this.configCaches,
      })
    } else {
      await this.builder.buildAsset({ src, dist })
    }
  }

  /**
   * Get typeName set in `wikic.config.typeMap`
   * @param {string} key
   * @return {string}
   */
  typeMap(key) {
    const map = this.config.typeMap
    if (Object.prototype.hasOwnProperty.call(map, key) && _.isString(map[key])) {
      return map[key]
    }
    if (this.config.typeNameTitleCase) return titleCase(key)
    return key
  }

  /**
   * Get a URL prefixed with base URL
   * @param {string} url
   * @return {string}
   */
  getURL(url) {
    return path.posix.join(path.posix.sep, this.config.baseurl, url)
  }
}

module.exports = Wikic
