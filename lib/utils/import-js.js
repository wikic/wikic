/* eslint-disable global-require, import/no-dynamic-require */

const fs = require('fs')
const uncache = require('require-uncache')

module.exports = (pathname) => {
  if (!pathname) throw Error('Expect pathname passed')
  if (!fs.existsSync(pathname)) return null
  uncache(pathname)
  return require(pathname)
}
