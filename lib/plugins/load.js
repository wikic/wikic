const fse = require('fs-extra');
const _ = require('lodash');
const path = require('path');

const getClosestConfigFromCache = require('../utils/getClosestConfigFromCache');
const getClosestConfig = require('../utils/getClosestConfig');

module.exports = async function load(context) {
  if (!_.isPlainObject(context)) throw Error('should pass a object to load.');

  const { configCaches, src, site: oSite } = context;
  if (typeof src !== 'string') throw Error('context.src must be a string.');
  if (!_.isPlainObject(oSite)) throw Error('context.site must be passed as a object.');

  const data = await fse.readFile(src, { encoding: 'utf8' });

  const srcDir = path.dirname(src);
  const site = _.isPlainObject(configCaches)
    ? await getClosestConfigFromCache(srcDir, oSite, configCaches)
    : await getClosestConfig(srcDir, oSite);

  return Object.assign(context, { data, site });
};
