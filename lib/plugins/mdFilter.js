const markdownIt = require('markdown-it')
const hljs = require('highlight.js')
const logger = require('../utils/log')

const md = markdownIt({
  html: true,
  linkify: true,
  typography: true,
  highlight(str, lang) {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return `<pre class="hljs"><code>${hljs.highlight(lang, str, true).value}</code></pre>`
      } catch (e) {
        logger.error(e)
      }
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
