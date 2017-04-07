const path = require('path')

exports.isString = any => typeof any === 'string'
exports.isFunction = any => typeof any === 'function'
exports.isMarkdown = filePath => path.extname(filePath) === '.md'
