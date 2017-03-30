const Promise = require('bluebird')
const findParentDir = require('find-parent-dir')

module.exports = Promise.promisify(findParentDir)
