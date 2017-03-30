const fsp = require('fs-promise')
const path = require('path')
const isObject = require('isobject')
const findParentDir = require('../utils/findParentDir')

const configFileName = '_config.json'

module.exports = async function load(context) {
  if (!isObject(context)) throw Error('should pass a object to load.')
  if (typeof context.from !== 'string') throw Error('context.from must be a string.')
  if (!isObject(context.config)) throw Error('context.config must be passed as a object.')
  const [data, config] = await Promise.all([
    fsp.readFile(context.from, { encoding: 'utf8' }),
    loadConfig(context.from, context.config),
  ])
  return Object.assign(context, { data, config })
}

async function loadConfig(from, defaultConfig) {
  const config = Object.assign({}, defaultConfig)
  const configPath = await findParentDir(path.dirname(from), configFileName)

  if (configPath) {
    const closestConfigPath = path.resolve(configPath, configFileName)
    const closestConfig = await fsp.readJson(closestConfigPath)
    Object.assign(config, closestConfig)
  }
  return config
}

module.exports.loadConfig = loadConfig
