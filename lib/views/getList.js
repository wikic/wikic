module.exports = function getList(
  wikic,
  docsInfos = wikic.docsInfos,
  type = '.',
  level = 0,
  id = -1
) {
  const head = level === 0
    ? ''
    : `<label for="${level}-${id}">${wikic.typeMap(type)}</label><input type="checkbox" id="${level}-${id}" data-type="${type}">`
  const sublists = Object.keys(docsInfos)
    .sort()
    .reverse()
    .map((key, idx) => {
      if (key === '_docs' && Array.isArray(docsInfos[key])) {
        const docs = docsInfos[key].map(
          item => `<li><a href="${wikic.getURL(item.address)}">${item.title}</a></li>`
        )
        return docs.join('')
      }
      return `<li>${getList(wikic, docsInfos[key], key, level + 1, idx)}</li>`
    })
    .join('')
  return `${head}<ul class="docs-list">${sublists}</ul>`
}
