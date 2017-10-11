const anymatch = require('anymatch')
const logger = require('../utils/log')

module.exports = function runCustomHandler(filePath, handlers, wikic) {
  if (handlers === null || typeof handlers !== 'object') return false

  const keys = Object.keys(handlers)

  for (let index = 0; index < keys.length; index += 1) {
    const key = keys[index]
    const { matcher, handler } = handlers[key]
    if (anymatch(matcher, filePath)) {
      if (typeof handler !== 'function') {
        throw Error(`[watch]: custom handler(${key}) should be a function`)
      }
      if (handler(filePath, wikic) !== false) {
        logger.verbose(`[watch]: custom handler(${key}) because ${filePath} changed`)
        return true
      }
    }
  }

  return false
}
