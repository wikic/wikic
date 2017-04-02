const toc = require('html-toc')
const isObject = require('isobject')

module.exports = (context) => {
  if (!isObject(context)) throw Error('expect context to be a Object')
  if (!isObject(context.config)) throw Error('expect context.config to be a Object')
  if (!isObject(context.config.page)) throw Error('expect context.config.page to be a Object')
  if (!context.config.page.toc) return context
  const selectors = context.tocSelectors || '.page-content > h2, .page-content > h3'
  const data = toc(context.data, {
    id: '#toc',
    anchorTemplate: id => ` <a class="anchor" href="#${id}">#</a>`,
    selectors,
  })
  return Object.assign(context, { data })
}
