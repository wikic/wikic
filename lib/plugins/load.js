const fsp = require('fs-promise')
const isObject = require('isobject')
const getClosestConfig = require('../utils/getClosestConfig')

module.exports = async function load(context) {
  if (!isObject(context)) throw Error('should pass a object to load.')
  if (typeof context.from !== 'string') throw Error('context.from must be a string.')
  if (!isObject(context.config)) throw Error('context.config must be passed as a object.')

  const [data, config] = await Promise.all([
    fsp.readFile(context.from, { encoding: 'utf8' }),
    getClosestConfig(context.from, context.config),
  ])

  return Object.assign(context, { data, config })
}
