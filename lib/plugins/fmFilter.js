const fm = require('front-matter')
const _ = require('lodash')

module.exports = (context) => {
  if (!_.isPlainObject(context)) throw Error('expect context to be a Object')
  if (typeof context.data !== 'string') throw Error('expect context.data to be a string')
  if (!_.isPlainObject(context.config)) throw Error('expect context.config to be a Object')
  const { data, config } = context
  const frontMatter = fm(data)
  const page = _.merge({}, config.page, frontMatter.attributes)
  const newConfig = _.merge({}, config, { page })
  const renderContext = { site: newConfig, page }
  return Object.assign(context, { data: frontMatter.body, config: newConfig, renderContext })
}
