const logger = require('../utils/log')

module.exports = function njFilter(context) {
  const { data: oData, renderContext: oRenderContext, page, site } = context
  const renderContext = Object.assign({}, oRenderContext, { page, site })

  const escapedData = oData
    .replace(/(<code ?[^>]*>)/gi, '$1{% raw %}')
    .replace(/(<\/code *>)/gi, '{% endraw %}$1')
  try {
    const data = this.renderer.renderString(escapedData, renderContext)
    return Object.assign(context, { data, renderContext })
  } catch (e) {
    logger.warn(`${e.message}, please check out ${context.src}`)
    return Object.assign(context, { renderContext })
  }
}
