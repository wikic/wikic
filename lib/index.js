/* eslint-disable
   no-underscore-dangle,
   no-await-in-loop,
   no-restricted-syntax,
   no-param-reassign,
   global-require,
   import/no-dynamic-require */

const fse = require('fs-extra');
const path = require('path');
const chokidar = require('chokidar');
const nunjucks = require('nunjucks');
const _ = require('lodash');
const importCwd = require('import-cwd');

const load = require('./plugins/load');
const mdFilter = require('./plugins/mdFilter');
const fmFilter = require('./plugins/fmFilter');
const njFilter = require('./plugins/njFilter');
const addTOC = require('./plugins/addTOC');

const { isMarkdown } = require('./utils/typeof');
const logger = require('./utils/log');
const getConfig = require('./utils/getConfig');
const createServer = require('./utils/createServer');
const glob = require('./utils/glob');
const capitalize = require('./utils/capitalize');

const PLUGINS = ['afterRead', 'beforeWrite', 'beforeRender'];
const TASKS = [
  'afterReadAllDocs',
  'beforeBuild',
  'beforeBuildDocs',
  'afterBuild',
  'afterBuildDocs',
];

class Wikic {
  constructor(cwd, config) {
    this._building = false;
    this.typeMap = this.typeMap.bind(this);
    this.fse = fse;
    this.setup(cwd, config);
  }

  setup(cwd, config) {
    this.cwd = cwd ? path.resolve(cwd) : this.cwd || process.cwd();
    this.config = _.merge({}, getConfig(this.cwd), config);

    const { root, publicPath, docsPath, layoutPath } = this.config;
    this.root = path.resolve(this.cwd, root);
    this.publicPath = path.resolve(this.root, publicPath);
    this.layoutPath = path.resolve(this.root, layoutPath);
    this.docsPath = path.resolve(this.root, docsPath);

    this._afterReadPlugins = [fmFilter, mdFilter, njFilter];
    this._beforeWritePlugins = [addTOC];

    PLUGINS.forEach(key => this._applyUserPlugins(key));
    TASKS.forEach(key => this._applyUserTasks(key));
    this._applyUserSuites();

    if (this.config.logger) {
      const { console, file } = this.config.logger;
      logger.transports.console.level = console;
      logger.transports.file.level = file;
    }

    this.renderer = nunjucks.configure(this.layoutPath, {
      trimBlocks: true,
      autoescape: true,
      watch: false,
    });
    this.renderer.addFilter('baseurl', url => this.getURL(url));
    this.renderer.addFilter('typeMap', key => this.typeMap(key));
    this.renderer.addFilter('typeMaps', arr => arr.map(key => this.typeMap(key)));

    return this;
  }

  async clean() {
    await fse.emptyDir(this.publicPath);
    logger.verbose('site cleaned!');
    return this;
  }

  async build() {
    if (this._building) {
      logger.error('Wikic is busy.');
      return this;
    }
    this._building = true;
    await this._execTasks('beforeBuild');
    this._configCaches = {
      dir2dir: {},
      dir2conf: {},
    };
    await Promise.all([this.buildStaticFiles(), this.buildDocs()]);
    logger.verbose('site rendered!');
    this._building = false;

    await this._execTasks('afterBuild');
    return this;
  }

  addPlugin(key, plugin) {
    const arrKey = `_${key}Plugins`;
    if (_.isString(plugin)) plugin = importCwd.silent(plugin);
    if (!_.isFunction(plugin)) throw Error('should pass a function');
    if (!PLUGINS.includes(key)) throw Error(`${key} is not a key for plugins`);
    if (!this[arrKey]) this[arrKey] = [];
    this[arrKey].push(plugin);
    return this;
  }

  addTask(key, task) {
    const arrKey = `_${key}Tasks`;
    if (_.isString(task)) task = importCwd.silent(task);
    if (!_.isFunction(task)) throw Error('should pass a function');
    if (!TASKS.includes(key)) throw Error(`${key} is not a key for tasks`);
    if (!this[arrKey]) this[arrKey] = [];
    this[arrKey].push(task);
    return this;
  }

  addSuite(oSuite) {
    if (!oSuite) throw Error('expect a suite passed');
    if (_.isString(oSuite)) oSuite = importCwd.silent(oSuite);
    const suite = _.isFunction(oSuite) ? oSuite(this.config) : oSuite;
    if (!suite) return this;

    PLUGINS.forEach((key) => {
      const plugin = suite[key];
      if (plugin) {
        this.addPlugin(key, plugin);
      }
    });
    TASKS.forEach((key) => {
      const task = suite[key];
      if (task) {
        this.addTask(key, task);
      }
    });
    return this;
  }

  _buildMD(_context) {
    return this._readMD(_context)
      .then(context => this._renderMD(context))
      .then(context => this._writeMD(context))
      .catch(logger.error);
  }

  async _readMD(oContext) {
    const context = await load(oContext);
    const { dist, page: oPage } = context;

    const page = Object.assign({}, oPage);
    page.address = this.getURL(path.relative(this.publicPath, dist).split(path.sep).join('/'));
    context.page = page;

    return this._execPlugins('afterRead', context);
  }

  async _writeMD(oContext) {
    const context = await this._execPlugins('beforeWrite', oContext);
    const { dist, data } = context;
    await fse.outputFile(dist, data);
    return context;
  }

  async _renderMD(oContext) {
    const context = await this._execPlugins('beforeRender', oContext);
    const { data: oData, page, renderContext: oRenderContext } = context;
    const { address, layout } = page;
    const renderContext = Object.assign(oRenderContext, {
      content: oData,
    });

    const from = path.dirname(address);
    this.renderer.addFilter('relative', to => path.posix.relative(from, to));
    const data = this.renderer.render(`${layout}.njk`, renderContext);

    return Object.assign(context, { data });
  }

  watch() {
    /* ignores all the files start _ (excludes layoutPath and docsPath) */
    const ignored = [
      /(^|[/\\])\../,
      `${this.config.publicPath}/**`,
      '**/node_modules/**',
      ...this.config.excludes,
    ];

    const startWith_ = [];
    [this.config.layoutPath, this.config.docsPath].forEach((pathname) => {
      if (/^_.+/.test(pathname)) {
        startWith_.push(pathname.replace(/^_/, ''));
      }
    });

    if (startWith_.length > 0) {
      ignored.push(`_!(${startWith_.join('|')})/**`);
    } else {
      ignored.push('_*/**');
    }

    chokidar
      .watch('**/*', {
        ignored,
        cwd: this.root,
        persistent: true,
      })
      .on('change', (filePath) => {
        logger.verbose(`File ${filePath} has been changed`);
        this.setup().build();
      })
      .on('unlink', (filePath) => {
        logger.verbose(`File ${filePath} has been removed`);
        fse.removeSync(path.join(this.publicPath, filePath));
      })
      .on('error', error => logger.error(`Watcher Error: ${error}`));
    return this;
  }

  async serve() {
    this.server = (await createServer({
      port: this.config.port,
      getCwd: () => this.publicPath,
      getBaseurl: () => this.config.baseurl,
    })).listen();
    return this;
  }

  async _execTasks(key) {
    const tasks = this[`_${key}Tasks`];
    if (!tasks) return;
    for (const task of tasks) {
      await task.call(this);
    }
  }

  async _execPlugins(key, context) {
    const plugins = this[`_${key}Plugins`];
    if (!plugins) return context;
    let newContext = context;
    for (const plugin of plugins) {
      newContext = await plugin.call(this, newContext);
    }
    return newContext;
  }

  async buildDocs() {
    await this._execTasks('beforeBuildDocs');
    const files = await glob('**/*.md', { cwd: this.docsPath });
    if (files.length < 1) return;
    const contexts = await Promise.all(files.map(filePath => this._readDoc(filePath)));
    await this._execTasks('afterReadAllDocs');
    await Promise.all(
      contexts.map(_context =>
        Promise.resolve(_context)
          .then(context => this._renderMD(context))
          .then(context => this._writeMD(context))
      )
    );
    await this._execTasks('afterBuildDocs');
  }

  _readDoc(filePath) {
    const src = path.join(this.docsPath, filePath);
    const types = path.dirname(filePath).split(path.posix.sep);
    const targetRelative = filePath.replace(/\.md$/, '.html');
    const dist = path.join(this.publicPath, targetRelative);
    const site = Object.assign({}, this.config);
    const page = { types };

    return this._readMD({
      src,
      dist,
      site,
      page,
      IS_DOC: true,
      configCaches: this._configCaches,
    });
  }

  _applyUserPlugins(funcKey) {
    const key = `${funcKey}Plugins`;
    if (this.config[key]) {
      this.config[key].forEach((plugin) => {
        this.addPlugin(funcKey, plugin);
      });
    }
    return this;
  }

  _applyUserTasks(funcKey) {
    const key = `${funcKey}Tasks`;
    if (this.config[key]) {
      this.config[key].forEach((task) => {
        this.addTask(funcKey, task);
      });
    }
    return this;
  }

  _applyUserSuites() {
    const { suites } = this.config;
    if (!suites) return this;
    suites.forEach((suite) => {
      this.addSuite(suite);
    });
    return this;
  }

  async buildStaticFiles() {
    const { excludes, publicPath } = this.config;
    const files = await glob('**/*', {
      cwd: this.root,
      nodir: true,
      ignore: [`${publicPath}/**`, '_*/**', '**/node_modules/**', 'wikic.config.js', ...excludes],
    });
    await Promise.all(
      files.map(async (filePath) => {
        const src = path.join(this.root, filePath);
        const dist = path.join(this.publicPath, filePath);
        if (isMarkdown(src)) {
          const site = Object.assign({}, this.config);
          await this._buildMD({
            site,
            src,
            dist: dist.replace(/\.md$/, '.html'),
            configCaches: this._configCaches,
          });
        } else {
          await fse.copy(src, dist);
        }
      })
    );
  }

  typeMap(key) {
    const map = this.config.typeMap;
    if (Object.prototype.hasOwnProperty.call(map, key) && _.isString(map[key])) {
      return map[key];
    }
    return capitalize(key);
  }

  getURL(url) {
    return path.posix.join(path.posix.sep, this.config.baseurl, url);
  }
}

module.exports = Wikic;
