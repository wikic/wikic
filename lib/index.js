/* eslint-disable no-underscore-dangle, no-await-in-loop, no-restricted-syntax */
const fse = require('fs-extra');
const path = require('path');
const chokidar = require('chokidar');
const nunjucks = require('nunjucks');
const _ = require('lodash');

const load = require('./plugins/load');
const collectInfo = require('./plugins/collectInfo');
const collectFlatInfo = require('./plugins/collectFlatInfo');
const mdFilter = require('./plugins/mdFilter');
const fmFilter = require('./plugins/fmFilter');
const njFilter = require('./plugins/njFilter');
const addTOC = require('./plugins/addTOC');

const { isMarkdown } = require('./utils/typeof');
const logger = require('./utils/log');
const getList = require('./utils/getList');
const getConfig = require('./utils/getConfig');
const createServer = require('./utils/createServer');
const glob = require('./utils/glob');
const capitalize = require('./utils/capitalize');

class Wikic {
  constructor(cwd, config) {
    this._getListOpts = null;
    this._building = false;
    this.typeMap = this.typeMap.bind(this);
    this.setup(cwd, config);
  }

  setup(cwd, config) {
    // after read before render
    this._afterReadPlugins = [fmFilter, mdFilter, njFilter, collectInfo, collectFlatInfo];
    // after render before write
    this._beforeWritePlugins = [addTOC];
    this.cwd = cwd ? path.resolve(cwd) : this.cwd || process.cwd();
    this.config = _.merge({}, getConfig(this.cwd), config);

    const { root, publicPath, docsPath, layoutPath } = this.config;
    this.root = path.resolve(this.cwd, root);
    this.publicPath = path.resolve(this.root, publicPath);
    this.layoutPath = path.resolve(this.root, layoutPath);
    this.docsPath = path.resolve(this.root, docsPath);

    this._applyUserPlugins('afterRead')._applyUserPlugins('beforeWrite');
    this.setListTemplate(this.config.listTemplate);

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
    this._configCaches = {
      dir2dir: {},
      dir2conf: {},
    };
    this._building = true;
    await Promise.all([this.buildStaticFiles(), this.buildDocs()]);
    logger.verbose('site rendered!');
    this._building = false;
    return this;
  }

  addPlugin(key, plugin) {
    const arrKey = `_${key}Plugins`;
    if (!_.isFunction(plugin)) throw Error('should pass a function');
    if (!Array.isArray(this[arrKey])) throw Error(`${key} is not a key for plugins`);
    this[arrKey].push(plugin);
    return this;
  }

  setListTemplate(opts) {
    this._getListOpts = opts;
    return this;
  }

  _buildMD(_context) {
    return this._readMD(_context)
      .then(context => this._renderMD(context))
      .then(context => this._writeMD(context))
      .catch(logger.error);
  }

  async _readMD(context) {
    let newContext = await load(context);
    const { dist, page: oPage } = newContext;

    const page = Object.assign({}, oPage);
    page.address = this.getURL(path.relative(this.publicPath, dist).split(path.sep).join('/'));
    newContext.page = page;

    for (const callback of this._afterReadPlugins) {
      newContext = await callback.call(this, newContext);
    }

    return newContext;
  }

  async _writeMD(context) {
    let newContext = context;

    for (const callback of this._beforeWritePlugins) {
      newContext = await callback.call(this, newContext);
    }

    const { dist, data } = newContext;

    if (_.isString(dist) && _.isString(data)) {
      await fse.outputFile(newContext.dist, newContext.data);
    }
    return newContext;
  }

  _renderMD(context) {
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

  async buildDocs() {
    this.infoTree = null;
    this.flatInfos = null;

    const files = await glob('**/*.md', { cwd: this.docsPath });
    const contexts = await Promise.all(files.map(filePath => this._readDoc(filePath)));

    this.list = getList(this.typeMap, this.infoTree, this._getListOpts);
    await Promise.all(
      contexts.map(_context =>
        Promise.resolve(_context)
          .then(context => this._beforeRenderDoc(context))
          .then(context => this._renderMD(context))
          .then(context => this._writeMD(context)))
    );
    await this._writeFlatInfos();
  }

  async _writeFlatInfos() {
    await fse.writeJSON(path.resolve(this.publicPath, 'flatInfos.json'), this.flatInfos);
  }

  _beforeRenderDoc(context) {
    const { renderContext: oldRenderContext } = context;

    const renderContext = Object.assign({}, oldRenderContext, {
      list: this.list,
    });

    return Object.assign(context, { renderContext });
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
