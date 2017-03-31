const toc = require('html-toc')

module.exports = (context) => {
  const data = toc(context.data, {
    id: '#toc',
    selectors: '.page-content > h2, .page-content > h3',
  })
  return Object.assign(context, { data })
}
