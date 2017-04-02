/* eslint-disable no-param-reassign, no-underscore-dangle */
const isObject = require('isobject')

module.exports = function fillInfo(context) {
  const { config } = context
  const { types, address, page } = config
  if (!page) {
    throw Error('docs must have front matter!')
  }
  const { title, hide } = page
  if (hide) return context
  const docInfo = {
    address,
    title,
  }
  types.reduce((parent, type, index, arr) => {
    if (!isObject(parent[type])) {
      parent[type] = { _docs: [] }
    }
    if (index === arr.length - 1) {
      parent[type]._docs.push(docInfo)
    }
    return parent[type]
  }, this.docsInfos)
  return context
}
