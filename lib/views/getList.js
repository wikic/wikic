const typeLink = require('./typeLink')

module.exports = function getList(types, docsInfos, wikic, level = 0) {
  function handle(key) {
    if (key === '_docs' && Array.isArray(docsInfos[key])) {
      const docs = docsInfos[key].map(item => `<li><a href="${wikic.getURL(item.address)}">${item.title}</a></li>`)
      return docs.join('')
    }
    return `<li>${getList(types.concat([key]), docsInfos[key], wikic, level + 1)}</li>`
  }
  const head = level === 0 ? '' : `<p data-level="${level}">${typeLink(wikic.getTypeLink(types))}</p>`

  return `${head}<ul class="docs-list">${Object.keys(docsInfos).sort().map(handle).join('')}</ul>`
}

