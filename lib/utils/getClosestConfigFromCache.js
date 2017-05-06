/* eslint-disable no-param-reassign */

const _ = require('lodash');
const path = require('path');

const findParentDir = require('./findParentDir');
const readYaml = require('./readYaml');

const CONFIG_FILENAME = '_config.yml';

async function getClosestConfigFromCache(srcDir, originalConfig, caches) {
  if (caches.dir2dir[srcDir]) {
    // find cache
    const configDir = caches.dir2dir[srcDir];
    return caches.dir2conf[configDir];
  }
  // not find cache
  const configDir = await findParentDir(srcDir, CONFIG_FILENAME);

  if (!configDir) {
    // not find _config.yml
    return Object.assign({}, originalConfig);
  }
  // find _config.yml, read and cache
  const config = _.merge({}, originalConfig, readYaml(path.resolve(configDir, CONFIG_FILENAME)));

  caches.dir2dir[srcDir] = configDir;
  caches.dir2conf[configDir] = config;
  return config;
}

module.exports = getClosestConfigFromCache;
