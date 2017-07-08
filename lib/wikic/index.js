/* eslint-disable
   no-await-in-loop,
   no-restricted-syntax,
   no-param-reassign,
   global-require,
   import/no-dynamic-require */

const fse = require('fs-extra');
const path = require('path');
const titleCase = require('title-case');
const chokidar = require('chokidar');
const _ = require('lodash');
const importCwd = require('import-cwd');

const loadFilters = require('./load-filters');
const getRenderer = require('./get-renderer');
const loadSuites = require('./load-suites');
const Ignored = require('./get-watch-ignored');
const getBuilder = require('./get-builder');
const setLogger = require('./set-logger');

const isMarkdown = require('../utils/is-markdown');
const logger = require('../utils/log');
const getConfig = require('../utils/get-config');
const createServer = require('../utils/create-server');
const glob = require('../utils/glob');
const Filter = require('../utils/filter');
const time = require('../utils/time');

const TYPES = [
  'afterRead',
  'beforeWrite',
  'beforeRender',
  'afterReadAllDocs',
  'beforeBuild',
  'beforeBuildDocs',
  'afterBuild',
  'afterBuildDocs',
];

class Wikic {
  constructor(cwd, config) {
    this.building = false;
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

    this.builder = getBuilder(this);
    this.renderer = getRenderer(this);
    this.filter = new Filter({
      strict: true,
      types: TYPES,
    });

    loadFilters(this);
    loadSuites(this);
    setLogger(this);
    return this;
  }

  async clean() {
    await fse.emptyDir(this.publicPath);
    logger.verbose('site cleaned!');
    return this;
  }

  async build() {
    if (this.building) {
      logger.error('Wikic is busy.');
      return this;
    }
    const startTime = process.uptime();
    this.building = true;
    await this.filter.exec('beforeBuild', null, this);
    this.configCaches = {
      dir2dir: {},
      dir2conf: {},
    };
    await Promise.all([this.buildStaticFiles(), this.buildDocs()]);
    logger.verbose(time(), 'Site Rendered', `after ${(process.uptime() - startTime).toFixed(3)} s`);
    this.building = false;

    await this.filter.exec('afterBuild', null, this);
    return this;
  }

  registerSuite(suite) {
    if (!suite) throw Error('expect a suite passed');

    if (_.isString(suite)) {
      const suiteStr = suite;
      suite = importCwd.silent(suite);
      if (!suite) {
        throw Error(`suite '${suiteStr}' not found`);
      }
    }

    suite = _.isFunction(suite) ? suite(this.config, this) : suite;

    if (!suite) {
      throw Error('suite function returns nothing');
    }

    TYPES.forEach((type) => {
      const task = suite[type];
      if (task) {
        this.filter.register(type, task);
      }
    });
    return this;
  }

  watch() {
    chokidar
      .watch('**/*', {
        ignored: Ignored(this),
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
    await this.filter.exec('beforeBuildDocs', null, this);
    const files = await glob('**/*.md', { cwd: this.docsPath });
    if (files.length < 1) return;
    const contexts = await Promise.all(files.map(this.builder.readDoc));
    await this.filter.exec('afterReadAllDocs', null, this);

    await Promise.all(
      contexts.map(context =>
        Promise.resolve(context).then(this.builder.renderMD).then(this.builder.writeMD)
      )
    );
    await this.filter.exec('afterBuildDocs', null, this);
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
          await this.builder.buildMD({
            site,
            src,
            dist: dist.replace(/\.md$/, '.html'),
            configCaches: this.configCaches,
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
    if (this.config.typeNameTitleCase) return titleCase(key);
    return key;
  }

  getURL(url) {
    return path.posix.join(path.posix.sep, this.config.baseurl, url);
  }
}

module.exports = Wikic;
