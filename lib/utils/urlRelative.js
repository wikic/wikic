const path = require('path')
const url = require('url')

const segmentLength = str => str.split('/').filter(Boolean).length

const relative = (from, to) => {
  const toUrl = url.parse(to)
  const fromUrl = url.parse(from)
  if (fromUrl.host !== toUrl.host) return to

  const fromPath = fromUrl.pathname
  const toPath = toUrl.pathname

  if (toPath[0] !== '/' || fromPath[0] !== '/') return to
  if (segmentLength(fromPath) >= segmentLength(toPath)) {
    return path.posix.relative(path.posix.dirname(fromPath), toPath)
  }
  return path.posix.relative(fromPath, toPath)
}

module.exports = relative
