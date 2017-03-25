const fsp = require('fs-promise')
const path = require('path')
const { findParentDir } = require('../utils/promisified')

module.exports = async function loadConfig({ fileFullPath, defaultConfig, configFileName }) {
  const config = Object.assign({}, defaultConfig)
  const configPath = await findParentDir(path.dirname(fileFullPath), configFileName)

  if (configPath) {
    const scopedConfig = await fsp.readJson(path.join(configPath, configFileName))
    Object.assign(config, scopedConfig)
  }
  return config
}
