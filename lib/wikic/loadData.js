const fse = require('fs-extra')
const _ = require('lodash')
const path = require('path')
const deleteProps = require('../utils/deleteProps')
const getClosestConfig = require('../utils/get-closest-config')

module.exports = async function loadData(context) {
  if (!_.isPlainObject(context)) throw Error('should pass a object to load.')

  const { configCaches, src, site: oldSite } = context
  if (typeof src !== 'string') throw Error('context.src must be a string.')
  if (!_.isPlainObject(oldSite)) {
    throw Error('context.site must be passed as a object.')
  }

  const data = await fse.readFile(src, 'utf8')

  const srcDir = path.dirname(src)
  const site = await getClosestConfig(srcDir, oldSite, configCaches)

  deleteProps(site, [
    'root',
    'docsPath',
    'port',
    'typeNameTitleCase',
    'publicExcludes',
    'watchExcludes',
    'typeMap',
    'excludes',
    'server',
    'baseurl',
    'logger',
    'suites',
    'watchHandlers',
  ])
  return Object.assign(context, { data, site })
}
