/**
 * pagic | (MIT) https://github.com/xcatliu/pagic/blob/master/LICENSE
 * https://github.com/xcatliu/pagic/blob/master/src/util/getConfig.js
 **/

const fs = require('fs')
const path = require('path')
const readYaml = require('./readYaml')

module.exports = function getConfig(cwd) {
  if (!path.isAbsolute(cwd)) throw Error('path should be absolude.')

  const defaultConfigPath = path.resolve(__dirname, '../defaultConfig.yml')
  const defaultConfig = readYaml(defaultConfigPath)

  const userConfigPath = path.resolve(cwd, '_config.yml')
  if (!fs.existsSync(userConfigPath)) {
    return Object.assign({}, defaultConfig)
  }
  const userConfig = readYaml(userConfigPath)
  return Object.assign({}, defaultConfig, userConfig)
}
