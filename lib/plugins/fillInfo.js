/* eslint-disable no-param-reassign, no-underscore-dangle */

module.exports = function fillInfo({ data, config }) {
  const { types, address, attributes } = config
  const { title, hide } = attributes
  if (hide) return { data, config }
  const docInfo = {
    address,
    title,
  }
  types.reduce((parent, type, index, arr) => {
    if (typeof parent[type] !== 'object') {
      parent[type] = { _docs: [] }
    }
    if (index === arr.length - 1) {
      parent[type]._docs.push(docInfo)
    }
    return parent[type]
  }, this.docsInfos)
  return { data, config }
}
