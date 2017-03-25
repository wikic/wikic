const fm = require('front-matter')
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
        return `<pre class="hljs"><code>${
          hljs.highlight(lang, str, true).value
          }</code></pre>`
      } catch (e) {
        logger.error(e)
      }
    }
    return `<pre class="hljs"><code>${md.utils.escapeHtml(str)}</code></pre>`
  },
})

exports.fmFilter = ({ data, config }) => {
  const { attributes, body } = fm(data)
  const newConfig = Object.assign({}, config, attributes)
  return { data: body, config: newConfig }
}

exports.mdFilter = ({ data, config }) => ({
  data: md.render(data),
  config,
})
