const fsp = require('fs-promise')
const _ = require('lodash')
const getClosestConfig = require('../utils/getClosestConfig')

module.exports = async function load(context) {
  if (!_.isPlainObject(context)) throw Error('should pass a object to load.')
  if (typeof context.src !== 'string') throw Error('context.src must be a string.')
  if (!_.isPlainObject(context.site)) throw Error('context.site must be passed as a object.')
  const data = await fsp.readFile(context.src, { encoding: 'utf8' })
  const site = await getClosestConfig(context.src, context.site)

  return Object.assign(context, { data, site })
}
