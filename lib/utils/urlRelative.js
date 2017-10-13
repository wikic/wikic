const path = require('path')
const url = require('url')

const segment = str => str.split('/').filter(Boolean)

const relative = (from, to) => {
  const toUrl = url.parse(to)
  const fromUrl = url.parse(from)
  if (fromUrl.host !== toUrl.host) return to

  const fromPath = fromUrl.pathname
  const toPath = toUrl.pathname

  if (toPath[0] !== '/' || fromPath[0] !== '/') return to
  const isDir = fromPath[fromPath.length - 1] === '/'

  const segFrom = segment(fromPath)
  if (
    segFrom.length >= segment(toPath).length ||
    (!isDir && /^.+.html$/.test(segFrom[segFrom.length - 1]))
  ) {
    return path.posix.relative(path.posix.dirname(fromPath), toPath)
  }

  return path.posix.relative(fromPath, toPath)
}

module.exports = relative
