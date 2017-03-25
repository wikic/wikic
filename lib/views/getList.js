const typeLink = require('./typeLink')

module.exports = function getList(types, docsInfos, wikic, level = 0) {
  function handle(key) {
    if (key === '_docs' && Array.isArray(docsInfos[key])) {
      const docs = docsInfos[key].map(item => `<li><a href="${wikic.getURL(item.address)}">${item.title}</a></li>`)
      return `<ul>${docs.join('')}</ul>`
    }
    return getList(types.concat([key]), docsInfos[key], wikic, level + 1)
  }
  const head = level === 0 ? '' : `<p>${typeLink(wikic.getTypeLink(types))}</p>`

  return `<section data-level="${level}">
  ${head}
  ${Object.keys(docsInfos).map(handle).join('')}
  </section>`
}
