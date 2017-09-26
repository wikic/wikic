/* eslint-disable global-require, import/no-dynamic-require */

const fs = require('fs')

module.exports = (pathname) => {
  if (!pathname) throw Error('Expect pathname passed')
  if (!fs.existsSync(pathname)) return null
  const data = require(pathname)
  delete require.cache[require.resolve(pathname)]
  return data
}
