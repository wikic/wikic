const Promise = require('bluebird')
const findParentDir = require('find-parent-dir')
const glob = require('glob')

exports.findParentDir = Promise.promisify(findParentDir)
exports.glob = Promise.promisify(glob)
