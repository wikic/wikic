const md = require('../filters/markdown')
const fm = require('../filters/front-matter')
const njk = require('../filters/nunjucks')
const toc = require('../filters/toc')

module.exports = (wikic) => {
  wikic.filter
    .register('afterRead', fm)
    .register('afterRead', md)
    .register('afterRead', njk)
    .register('beforeWrite', toc)
}
