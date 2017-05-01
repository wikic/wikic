const path = require('path');
const _ = require('lodash');

const findParentDir = require('./findParentDir');
const readYaml = require('./readYaml');

const CONFIG_FILENAME = '_config.yml';

async function getClosetConfig(srcDir, originalConfig) {
  const config = Object.assign({}, originalConfig);
  const configPath = await findParentDir(srcDir, CONFIG_FILENAME);

  if (configPath) {
    const closestConfigPath = path.resolve(configPath, CONFIG_FILENAME);
    const closestConfig = readYaml(closestConfigPath);
    _.merge(config, closestConfig);
  }
  return config;
}

module.exports = getClosetConfig;
