const fsp = require('fs-promise')
const path = require('path')
const defaultConfig = require('../defaultConfig.json')

module.exports = function getConfig(cwd) {
  if (!path.isAbsolute(cwd)) throw Error('path should be absolude.')
  const userConfigPath = path.resolve(cwd, '_config.json')
  if (!fsp.existsSync(userConfigPath)) return Object.assign({}, defaultConfig)
  const userConfig = fsp.readJsonSync(userConfigPath)
  return Object.assign({}, defaultConfig, userConfig)
}
