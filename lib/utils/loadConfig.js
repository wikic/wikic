const fsp = require('fs-promise')
const path = require('path')
const { findParentDir } = require('./promisified')

const configFileName = '_config.json'

module.exports = async function loadConfig(from, defaultConfig) {
  const config = Object.assign({}, defaultConfig)
  const configPath = await findParentDir(path.dirname(from), configFileName)

  if (configPath) {
    const parentConfig = await fsp.readJson(path.join(configPath, configFileName))
    Object.assign(config, parentConfig)
  }
  return config
}
