const nunjucks = require('nunjucks')
const logger = require('../utils/log')

module.exports = (context) => {
  const { data: oData, renderContext } = context
  const escapedData = oData
    .replace(/(<code ?[^>]*>)/gi, '$1{% raw %}')
    .replace(/(<\/code *>)/gi, '{% endraw %}$1')
  try {
    const data = nunjucks.renderString(escapedData, renderContext)
    return Object.assign(context, { data })
  } catch (e) {
    logger.warn(`${e.message}, please check out ${context.from}`)
    return context
  }
}
