const fm = require('front-matter')
const isObject = require('isobject')

module.exports = (context) => {
  if (!isObject(context)) throw Error('expect context to be a Object')
  if (typeof context.data !== 'string') throw Error('expect context.data to be a string')
  const { data, config } = context
  const frontMatter = fm(data)
  const page = Object.assign({}, config.page, frontMatter.attributes)
  const newConfig = Object.assign({}, config, { page })
  return Object.assign(context, { data: frontMatter.body, config: newConfig })
}
