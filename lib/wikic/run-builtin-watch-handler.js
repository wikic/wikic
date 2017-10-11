const logger = require('../utils/log')
const builtinWatchHandlers = require('./builtin-watch-handlers')

module.exports = (filePath, matchers, wikic) => {
  const keys = Object.keys(builtinWatchHandlers)
  for (let index = 0; index < keys.length; index += 1) {
    const key = keys[index]
    const matcher = matchers[key]
    const handler = builtinWatchHandlers[key]
    if (handler(filePath, wikic, matcher) !== false) {
      logger.verbose(`[watch]: ${key} because ${filePath} changed`)
      return true
    }
  }
  return false
}
