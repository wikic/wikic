const defaultOptions = {
  /**
   * @param {Object} options
   * @return {String} header of sublist
   **/
  headerTemplate(
    {
      level, // Number, level/depth of list
      index, // Number, index in the superlist
      typeName, // String, Mapped type name
      typeID, // String, type(dirname)
    }
  ) {
    return `<label for="${level}-${index}">${typeName}</label><input type="checkbox" id="${level}-${index}" data-type="${typeID}">`
  },

  subListTemplate(sublist) {
    // template to wrap sublist
    return `<li>${sublist}</li>`
  },

  itemTemplate(title, address) {
    // template of document item link
    return `<li><a href="${address}">${title}</a></li>`
  },

  listTemplate(header, items) {
    return `${header}<ul class="docs-list">${items}</ul>`
  },
}

module.exports = function getList(
  wikic,
  docsInfos,
  opts,
  set = false,
  type = '.',
  level = 0,
  id = -1
) {
  let options

  if (!set) {
    options = Object.assign({}, defaultOptions, opts)
  } else {
    options = opts
  }

  const { headerTemplate, subListTemplate, itemTemplate, listTemplate } = options
  const header = level === 0
    ? ''
    : headerTemplate({
      level,
      index: id,
      typeName: wikic.typeMap(type),
      typeID: type,
    })
  const items = Object.keys(docsInfos)
    .sort()
    .reverse()
    .map((key, idx) => {
      if (key === '_docs' && Array.isArray(docsInfos[key])) {
        const docs = docsInfos[key].map(item =>
          itemTemplate(item.title, wikic.getURL(item.address)))
        return docs.join('')
      }
      return subListTemplate(getList(wikic, docsInfos[key], options, true, key, level + 1, idx))
    })
    .join('')
  return listTemplate(header, items)
}
