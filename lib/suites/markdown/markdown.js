const markdownIt = require('markdown-it')
const prism = require('markdown-it-prism')

module.exports = context => {
  const { data } = context
  const opts = context.site.markdownIt || {}
  const { disableBuiltInPlugins, getInstance } = opts
  delete opts.disableBuiltInPlugins
  delete opts.getInstance

  const md = markdownIt(
    Object.assign(
      {
        html: true,
        linkify: true,
        typography: true,
      },
      opts
    )
  )
  if (!disableBuiltInPlugins) {
    md.use(prism)
  }
  if (typeof getInstance === 'function') {
    getInstance(md)
  }

  return Object.assign(context, {
    data: md.render(data),
  })
}
