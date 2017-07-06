const glob = require('glob');
const util = require('util');

module.exports = util.promisify(glob);
