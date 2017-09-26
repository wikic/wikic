/**
 * pagic | (MIT) https://github.com/xcatliu/pagic/blob/master/LICENSE
 * https://github.com/xcatliu/pagic/blob/master/src/util/getConfig.js
 * */

const path = require('path')
const _ = require('lodash')
const loadJS = require('./import-js')
const readYaml = require('./read-yaml')

module.exports = function getConfig(cwd) {
  if (!path.isAbsolute(cwd)) throw Error('path should be absolude.')

  const defaultConfigPath = path.resolve(__dirname, '../defaultConfig.yml')
  const defaultConfig = readYaml(defaultConfigPath)

  const userYamlConfigPath = path.resolve(cwd, '_config.yml')
  const userYamlConfig = readYaml(userYamlConfigPath)

  const userJSConfigPath = path.resolve(cwd, 'wikic.config.js')
  const userJSConfig = loadJS(userJSConfigPath)

  const config = _.merge({}, defaultConfig, userYamlConfig, userJSConfig)

  return config
}
