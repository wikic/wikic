const path = require('path')

exports.isMarkdown = filePath => path.extname(filePath) === '.md'
