const path = require('path');
const _ = require('lodash');
const findParentDir = require('./findParentDir');
const readYaml = require('./readYaml');

const configFileName = '_config.yml';

async function getClosetConfig(src, defaultConfig) {
  const config = Object.assign({}, defaultConfig);
  const configPath = await findParentDir(path.dirname(src), configFileName);

  if (configPath) {
    const closestConfigPath = path.resolve(configPath, configFileName);
    const closestConfig = readYaml(closestConfigPath);
    _.merge(config, closestConfig);
  }
  return config;
}

module.exports = getClosetConfig;
