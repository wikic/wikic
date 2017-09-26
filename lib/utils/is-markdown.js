const path = require('path')

module.exports = filePath => path.extname(filePath) === '.md'
