const util = require('util')
const findParentDir = require('find-parent-dir')

module.exports = util.promisify(findParentDir)
