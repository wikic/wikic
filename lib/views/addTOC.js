const toc = require('html-toc')

module.exports = html => toc(html, {
  id: '#toc',
  selectors: '.page-content > h2, .page-content > h3',
  slugify: string => string.replace(/[\s&/\\#,.+=$~%'":*?<>{}\][()@`]/g, '').toLowerCase(),
})
