const markdownIt = require('markdown-it')
const hljs = require('highlight.js')

module.exports = context => {
  const { data } = context
  const config = context.site.markdownIt
  const md = markdownIt(
    Object.assign(
      {
        html: true,
        linkify: true,
        typography: true,
        highlight(str, lang) {
          if (lang && hljs.getLanguage(lang)) {
            return `<pre class="hljs"><code>${hljs.highlight(lang, str, true).value}</code></pre>`
          }
          return `<pre class="hljs"><code>${md.utils.escapeHtml(str)}</code></pre>`
        },
      },
      config
    )
  )
  return Object.assign(context, {
    data: md.render(data),
  })
}
