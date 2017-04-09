const fsp = require('fs-promise')
const _ = require('lodash')
const getClosestConfig = require('../utils/getClosestConfig')

module.exports = async function load(context) {
  if (!_.isPlainObject(context)) throw Error('should pass a object to load.')
  if (typeof context.from !== 'string') throw Error('context.from must be a string.')
  if (!_.isPlainObject(context.config)) throw Error('context.config must be passed as a object.')
  const data = await fsp.readFile(context.from, { encoding: 'utf8' })
  const config = await getClosestConfig(context.from, context.config)

  return Object.assign(context, { data, config })
}
