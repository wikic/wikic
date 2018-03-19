const fs = require('fs')
const uncache = require('./uncache')

module.exports = pathname => {
  if (!pathname) throw Error('Expect pathname passed')
  if (!fs.existsSync(pathname)) return null
  uncache(pathname)
  return require(pathname)
}
