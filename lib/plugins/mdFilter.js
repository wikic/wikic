const markdownIt = require('markdown-it')
const hljs = require('highlight.js')

const md = markdownIt({
  html: true,
  linkify: true,
  typography: true,
  highlight(str, lang) {
    if (lang && hljs.getLanguage(lang)) {
      return `<pre class="hljs"><code>${hljs.highlight(lang, str, true).value}</code></pre>`
    }
    return `<pre class="hljs"><code>${md.utils.escapeHtml(str)}</code></pre>`
  },
})

module.exports = (context) => {
  const { data } = context
  return Object.assign(context, {
    data: md.render(data),
  })
}
