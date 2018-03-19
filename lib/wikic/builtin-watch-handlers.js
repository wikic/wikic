const anymatch = require('anymatch')
const getStaticIgnored = require('./get-static-ignored')

module.exports = {
  setupAndBuild: (filePath, wikic, matches) => {
    if (!anymatch(matches, filePath)) return false
    return wikic.setup().build()
  },
  build: (filePath, wikic, matches) => {
    if (!anymatch(matches, filePath)) return false
    return wikic.build()
  },
  buildStaticFile: (filePath, wikic, matches) => {
    if (anymatch(getStaticIgnored(wikic.config), filePath) || !anymatch(matches, filePath)) {
      return false
    }
    return wikic.buildStaticFile(filePath).then(() => wikic.filter.exec('afterBuild', null, wikic))
  },
}
